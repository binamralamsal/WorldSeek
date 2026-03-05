import type { AllowedChatSearchKey, AllowedChatTimeKey } from "../types";
import {
  allowedChatSearchKeys,
  allowedChatTimeKeys,
} from "../config/constants";

export type GameMode = "map" | "flag";
const allowedModes: GameMode[] = ["map", "flag"];

type ParseResult = {
  searchKey: AllowedChatSearchKey | undefined;
  timeKey: AllowedChatTimeKey | undefined;
  mode: GameMode | undefined;
  target: string | undefined;
};

export function parseLeaderboardInput(
  input: string,
  defaultSearchKey?: AllowedChatSearchKey,
  defaultTimeKey?: AllowedChatTimeKey | null,
): ParseResult {
  const parts = input.toLowerCase().trim().split(/\s+/).filter(Boolean);

  let target: string | undefined;
  let foundSearchKey: AllowedChatSearchKey | undefined;
  let foundTimeKey: AllowedChatTimeKey | undefined;
  let foundMode: GameMode | undefined;

  for (const part of parts) {
    if (allowedChatSearchKeys.includes(part as AllowedChatSearchKey)) {
      foundSearchKey = part as AllowedChatSearchKey;
      continue;
    }

    if (allowedChatTimeKeys.includes(part as AllowedChatTimeKey)) {
      foundTimeKey = part as AllowedChatTimeKey;
      continue;
    }

    if (allowedModes.includes(part as GameMode)) {
      foundMode = part as GameMode;
      continue;
    }

    if (part.startsWith("@") || /^\d+$/.test(part)) {
      target = part;
      continue;
    }

    if (!target && parts.indexOf(part) === 0) {
      target = part;
    }
  }

  const searchKey = foundSearchKey || defaultSearchKey;
  const timeKey =
    foundTimeKey || (defaultTimeKey === null ? undefined : defaultTimeKey);

  return { searchKey, timeKey, mode: foundMode, target };
}

export function parseLeaderboardFilters(
  input: string,
  defaultSearchKey: AllowedChatSearchKey = "group",
  defaultTimeKey: AllowedChatTimeKey = "month",
  defaultMode: GameMode = "map",
) {
  const parts = input.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const searchKey = (parts.find((part) =>
    allowedChatSearchKeys.includes(part as AllowedChatSearchKey),
  ) || defaultSearchKey) as AllowedChatSearchKey;

  const timeKey = (parts.find((part) =>
    allowedChatTimeKeys.includes(part as AllowedChatTimeKey),
  ) || defaultTimeKey) as AllowedChatTimeKey;

  const mode = (parts.find((part) => allowedModes.includes(part as GameMode)) ||
    defaultMode) as GameMode;

  return { searchKey, timeKey, mode };
}
