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
