export const UPDATES_CHANNEL = "https://t.me/WordSeek";
export const DISCUSSION_GROUP = "https://t.me/WordGuesser";

export const allowedChatSearchKeys = ["global", "group"] as const;
export const allowedChatTimeKeys = [
  "today",
  "week",
  "month",
  "year",
  "all",
] as const;
