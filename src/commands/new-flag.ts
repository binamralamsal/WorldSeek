import { Composer } from "grammy";

import { db } from "../config/db";
import { CommandsHelper } from "../util/commands-helper";
import { CountrySelector } from "../util/country-selector";
import { regularGameGuards, runGuards } from "../util/guards";

const composer = new Composer();

composer.command("newflag", async (ctx) => {
  if (!ctx.chat || !ctx.from) return;

  const chatId = ctx.chat.id.toString();
  const topicId = ctx.msg.message_thread_id?.toString() || "general";

  const guard = await runGuards(ctx, regularGameGuards);
  if (!guard.ok) return ctx.reply(guard.message);

  const topicSettings = await db
    .selectFrom("chatGameTopics")
    .select("allowedModes")
    .where("chatId", "=", chatId)
    .where("topicId", "=", topicId)
    .executeTakeFirst();

  const allowedModes = topicSettings?.allowedModes ?? ["map", "flag"];

  if (!allowedModes.includes("flag")) {
    return ctx.reply(
      "Flag mode is not allowed in this topic. Use /newworld instead.",
    );
  }

  const existing = await db
    .selectFrom("games")
    .selectAll()
    .where("chatId", "=", chatId)
    .where("topicId", "=", topicId)
    .executeTakeFirst();

  if (existing) {
    return ctx.reply("A game is already running here.");
  }

  const countrySelector = new CountrySelector();
  const randomCountry = await countrySelector.getRandomCountry(chatId);

  await db
    .insertInto("games")
    .values({
      chatId: chatId,
      topicId: topicId,
      countryCode: randomCountry.code,
      startedBy: ctx.from.id.toString(),
      mode: "flag",
    })
    .execute();

  await ctx.replyWithPhoto(randomCountry.flag, {
    caption: "🚩 FlagSeek started!\nGuess the country by its flag.",
    protect_content: true,
  });
});

CommandsHelper.addNewCommand("newflag", "Guess the country from its flag");

export const newFlagCommand = composer;
