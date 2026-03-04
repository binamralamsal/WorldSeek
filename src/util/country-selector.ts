import { randomInt } from "crypto";

import { redis } from "../config/redis";
import type { Country } from "../types";
import countries from "../data/countries.json";

const COUNTRY_LIST = countries as Country[];
const REGIONS = [...new Set(COUNTRY_LIST.map((c) => c.region))];

export interface CountrySelectorConfig {
  historySize: number;
  resetThreshold: number;
  ttlSeconds: number;
  regionHistorySize: number;
  regionResetThreshold: number;
}

export class CountrySelector {
  private config: CountrySelectorConfig;

  constructor(config: Partial<CountrySelectorConfig> = {}) {
    this.config = {
      historySize: config.historySize ?? 50,
      resetThreshold: config.resetThreshold ?? 10,
      ttlSeconds: config.ttlSeconds ?? 7 * 24 * 60 * 60,
      regionHistorySize:
        config.regionHistorySize ?? Math.ceil(REGIONS.length * 0.6),
      regionResetThreshold: config.regionResetThreshold ?? 2,
    };
  }

  private historyKey(chatId: string | number): string {
    return `h:${chatId}:countries`;
  }

  private regionHistoryKey(chatId: string | number): string {
    return `h:${chatId}:regions`;
  }

  async getRandomCountry(chatId: string | number): Promise<Country> {
    const historyKey = this.historyKey(chatId);
    const regionHistoryKey = this.regionHistoryKey(chatId);

    try {
      const pipeline = redis.pipeline();
      pipeline.smembers(historyKey);
      pipeline.scard(historyKey);
      pipeline.smembers(regionHistoryKey);
      pipeline.scard(regionHistoryKey);
      const results = await pipeline.exec();

      if (!results || results.length !== 4) {
        throw new Error("Pipeline failed");
      }

      const usedCodes = (results[0]?.[1] ?? []) as string[];
      const setSize = (results[1]?.[1] ?? 0) as number;
      const usedRegions = (results[2]?.[1] ?? []) as string[];
      const regionSetSize = (results[3]?.[1] ?? 0) as number;

      const availableCountries = COUNTRY_LIST.filter(
        (c) => !usedCodes.includes(c.code),
      );

      if (availableCountries.length < this.config.resetThreshold) {
        const recentCodes = usedCodes.slice(
          -Math.floor(this.config.resetThreshold / 2),
        );
        await redis.del(historyKey);
        if (recentCodes.length > 0) {
          await redis.sadd(historyKey, ...recentCodes);
        }
        return this.getRandomCountry(chatId);
      }

      const availableRegions = [
        ...new Set(availableCountries.map((c) => c.region)),
      ].filter((r) => !usedRegions.includes(r));

      const regionsToUse =
        availableRegions.length < this.config.regionResetThreshold
          ? [...new Set(availableCountries.map((c) => c.region))]
          : availableRegions;

      if (availableRegions.length < this.config.regionResetThreshold) {
        const recentRegions = usedRegions.slice(
          -Math.floor(this.config.regionResetThreshold / 2),
        );
        await redis.del(regionHistoryKey);
        if (recentRegions.length > 0) {
          await redis.sadd(regionHistoryKey, ...recentRegions);
        }
      }

      const randomRegion = regionsToUse[randomInt(0, regionsToUse.length)];
      const regionCountries = availableCountries.filter(
        (c) => c.region === randomRegion,
      );
      const selected = regionCountries[randomInt(0, regionCountries.length)];
      if (!selected) throw new Error("No countries available in region");

      const updatePipeline = redis.pipeline();

      updatePipeline.sadd(historyKey, selected.code);
      updatePipeline.expire(historyKey, this.config.ttlSeconds);
      if (setSize >= this.config.historySize) {
        updatePipeline.spop(
          historyKey,
          Math.floor(this.config.historySize * 0.2),
        );
      }

      updatePipeline.sadd(regionHistoryKey, selected.region);
      updatePipeline.expire(regionHistoryKey, this.config.ttlSeconds);
      if (regionSetSize >= this.config.regionHistorySize) {
        updatePipeline.spop(
          regionHistoryKey,
          Math.floor(this.config.regionHistorySize * 0.2),
        );
      }

      await updatePipeline.exec();

      return selected;
    } catch (error) {
      console.error("Redis error, using fallback:", error);
      const randomRegion = REGIONS[randomInt(0, REGIONS.length)]!;
      const regionCountries = COUNTRY_LIST.filter(
        (c) => c.region === randomRegion,
      );
      return regionCountries[randomInt(0, regionCountries.length)]!;
    }
  }

  async resetChat(chatId: string | number) {
    await redis.del(this.historyKey(chatId));
    await redis.del(this.regionHistoryKey(chatId));
  }

  async getChatStats(chatId: string | number) {
    const totalCount = COUNTRY_LIST.length;
    try {
      const [usedCount, usedRegionCount] = await Promise.all([
        redis.scard(this.historyKey(chatId)),
        redis.scard(this.regionHistoryKey(chatId)),
      ]);
      return {
        usedCount,
        availableCount: totalCount - usedCount,
        totalCount,
        usedRegionCount,
        availableRegionCount: REGIONS.length - usedRegionCount,
        totalRegionCount: REGIONS.length,
      };
    } catch (error) {
      return {
        usedCount: 0,
        availableCount: totalCount,
        totalCount,
        usedRegionCount: 0,
        availableRegionCount: REGIONS.length,
        totalRegionCount: REGIONS.length,
      };
    }
  }

  async getRecentCountries(chatId: string | number): Promise<Country[]> {
    try {
      const codes = await redis.smembers(this.historyKey(chatId));
      return COUNTRY_LIST.filter((c) => codes.includes(c.code));
    } catch (error) {
      console.error("Error getting recent countries:", error);
      return [];
    }
  }

  async getRecentRegions(chatId: string | number): Promise<string[]> {
    try {
      return await redis.smembers(this.regionHistoryKey(chatId));
    } catch (error) {
      console.error("Error getting recent regions:", error);
      return [];
    }
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<CountrySelectorConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}
