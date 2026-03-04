import { Composer, InputFile } from "grammy";

import { join } from "path";

import { db } from "../config/db";
import { CommandsHelper } from "../util/commands-helper";
import { CountrySelector } from "../util/country-selector";
import { regularGameGuards, runGuards } from "../util/guards";

const composer = new Composer();

composer.command("newworld", async (ctx) => {
  if (!ctx.chat || !ctx.from) return;

  const chatId = ctx.chat.id.toString();
  const topicId = ctx.msg.message_thread_id?.toString() || "general";

  const guard = await runGuards(ctx, regularGameGuards);
  if (!guard.ok) return ctx.reply(guard.message);

  const existing = await db
    .selectFrom("games")
    .selectAll()
    .where("chatId", "=", chatId)
    .where("topicId", "=", topicId)
    .executeTakeFirst();

  if (existing) {
    return ctx.reply("A WorldSeek game is already running here.");
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
    })
    .execute();

  const imagePath = join(
    process.cwd(),
    "src",
    "data",
    "countries",
    `${randomCountry.code.toLowerCase()}.png`,
  );

  await ctx.replyWithPhoto(new InputFile(imagePath), {
    caption: "🌍 WorldSeek started!\nGuess the country.",
    protect_content: true,
  });
});

CommandsHelper.addNewCommand(
  "newworld",
  "Guess the country with map given and distance",
);

export const newWorldCommand = composer;
