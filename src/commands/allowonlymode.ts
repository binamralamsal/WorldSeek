import { Composer } from "grammy";

import { db } from "../config/db";
import { CommandsHelper } from "../util/commands-helper";
import { adminOnlyGuards, runGuards } from "../util/guards";
import type { GameMode } from "../util/parse-leaderboard-inputs";

const composer = new Composer();

const VALID_MODES: GameMode[] = ["map", "flag"];

composer.command("allowonlymode", async (ctx) => {
  if (!ctx.message) return;

  if (!ctx.chat?.is_forum) {
    return ctx.reply("This command can only be used in forum groups.");
  }

  const guard = await runGuards(ctx, adminOnlyGuards);
  if (!guard.ok) return ctx.reply(guard.message);

  const topicId = ctx.msg.message_thread_id?.toString() || "general";

  const args = ctx.message.text
    .split(" ")
    .slice(1)
    .map((x) => x.toLowerCase());
  if (!args.length) {
    return ctx.reply("Usage: /allowonlymode map flag\nValid modes: map, flag");
  }

  const modes = args.filter((x) =>
    VALID_MODES.includes(x as GameMode),
  ) as GameMode[];

  if (!modes.length) {
    return ctx.reply("Invalid modes. Valid options are: map, flag");
  }

  try {
    const existing = await db
      .selectFrom("chatGameTopics")
      .selectAll()
      .where("chatId", "=", ctx.chat.id.toString())
      .where("topicId", "=", topicId)
      .executeTakeFirst();

    if (!existing) {
      return ctx.reply(
        "This topic is not set for the game.\nUse /setgametopic first.",
      );
    }

    await db
      .updateTable("chatGameTopics")
      .set({ allowedModes: modes })
      .where("chatId", "=", ctx.chat.id.toString())
      .where("topicId", "=", topicId)
      .execute();

    const modeLabels: Record<GameMode, string> = {
      map: "🗺 Map",
      flag: "🚩 Flag",
    };
    const modeList = modes.map((m) => modeLabels[m]).join(", ");

    return ctx.reply(`Allowed game modes updated.\nAllowed: ${modeList}`);
  } catch (err) {
    console.error(err);
    return ctx.reply("Failed to update allowed modes.");
  }
});

CommandsHelper.addNewCommand(
  "allowonlymode",
  "Set allowed game modes for this topic (e.g. /allowonlymode map)",
);

export const allowOnlyModeCommand = composer;
