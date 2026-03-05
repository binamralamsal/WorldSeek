import { InlineKeyboard } from "grammy";

import { formatActiveButton } from "../commands/help";
import type { GameMode } from "../util/parse-leaderboard-inputs";
import type { AllowedChatSearchKey, AllowedChatTimeKey } from "../types";
import {
  DISCUSSION_GROUP,
  UPDATES_CHANNEL,
  allowedChatSearchKeys,
  allowedChatTimeKeys,
} from "../config/constants";

const allowedModes: GameMode[] = ["map", "flag"];

export function generateLeaderboardKeyboard(
  searchKey: AllowedChatSearchKey,
  timeKey: AllowedChatTimeKey,
  mode: GameMode = "map",
  callbackKey: "leaderboard" | `score ${string | number}` = "leaderboard",
  backButton?: { text: string; callback: string },
) {
  const keyboard = new InlineKeyboard();

  // Mode row
  allowedModes.forEach((m) => {
    keyboard
      .text(
        generateButtonText(mode, m, m === "map" ? "🗺 Map" : "🚩 Flag"),
        `${callbackKey} ${searchKey} ${timeKey} ${m}`,
      )
      .style(mode === m ? "primary" : undefined);
  });

  keyboard.row();

  // Search key row
  allowedChatSearchKeys.forEach((key) => {
    keyboard
      .text(
        generateButtonText(
          searchKey,
          key,
          key === "group" ? "This chat" : "Global",
        ),
        `${callbackKey} ${key} ${timeKey} ${mode}`,
      )
      .style(searchKey === key ? "primary" : undefined);
  });

  keyboard.row();

  // Time key rows
  allowedChatTimeKeys.forEach((key, index) => {
    keyboard
      .text(
        generateButtonText(
          timeKey,
          key,
          key === "all"
            ? "All time"
            : key === "today"
              ? "Today"
              : `This ${key}`,
        ),
        `${callbackKey} ${searchKey} ${key} ${mode}`,
      )
      .style(timeKey === key ? "primary" : undefined);

    if ((index + 1) % 3 === 0) keyboard.row();
  });

  keyboard.row();
  keyboard.url("📢 Updates", UPDATES_CHANNEL);
  keyboard.text("🔄", `${callbackKey} ${searchKey} ${timeKey} ${mode}`);
  keyboard.url("💬 Discussion", DISCUSSION_GROUP);

  if (backButton) {
    keyboard.row();
    keyboard.text(backButton.text, backButton.callback);
  }

  return keyboard;
}

function generateButtonText<T>(key: T, currentKey: T, label: string) {
  return formatActiveButton(label, key === currentKey);
}
