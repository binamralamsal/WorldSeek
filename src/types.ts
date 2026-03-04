import { allowedChatSearchKeys, allowedChatTimeKeys } from "./config/constants";

export type Country =
  | {
      code: string;
      name: string;
      aliases: string[];
      flag: string;
      lat: number;
      lng: number;
      capital: string;
      region: string;
      population: number;
      borders: string[];
      unMember: boolean;
      area: number;
      carSide: string;
      continents: string[];
      startOfWeek: string;
    }
  | {
      code: string;
      name: string;
      aliases: string[];
      flag: string;
      lat: number;
      lng: number;
      region: string;
      population: number;
      borders: string[];
      unMember: boolean;
      area: number;
      carSide: string;
      continents: string[];
      startOfWeek: string;
      capital: undefined;
    };

export type AllowedChatSearchKey = (typeof allowedChatSearchKeys)[number];
export type AllowedChatTimeKey = (typeof allowedChatTimeKeys)[number];

export type LeaderboardEntry = {
  userId: string;
  name: string;
  username: string | null;
  totalScore: number;
};
