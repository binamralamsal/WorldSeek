import { Composer, InlineKeyboard, InputFile } from "grammy";

import { createReadStream } from "fs";

import { CommandsHelper } from "../util/commands-helper";
import { DISCUSSION_GROUP, UPDATES_CHANNEL } from "../config/constants";

const composer = new Composer();

composer.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .url(
      "Add me to your Group",
      `https://t.me/${ctx.me.username}?startgroup=true`,
    )
    .row()
    .url("Updates", UPDATES_CHANNEL)
    .text("Help", "help_howto")
    .url("Discussion", DISCUSSION_GROUP);

  const caption = `<b>Welcome to WorldSeek!</b>

A fun geography guessing game you can play directly on Telegram.

<blockquote><b>How it works:</b>
• The bot sends the silhouette of a random country
• Guess which country it is
• After each guess, you'll see the distance between your guess and the correct country
• Use the distance hints to get closer
• First person to guess correctly wins <b>10 points</b></blockquote>

<blockquote><b>Quick Start:</b>
• Use <code>/newworld</code> to start a new game
• Add me to a group with admin permissions to play with friends
• Use <code>/help</code> to see all commands and instructions</blockquote>

Ready to test your geography skills? Let's play!`;

  try {
    await ctx.replyWithPhoto(
      new InputFile(createReadStream("./src/data/banner.png")),
      {
        caption,
        parse_mode: "HTML",
        reply_markup: keyboard,
      },
    );
  } catch {
    await ctx.reply(caption, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });
  }
});

CommandsHelper.addNewCommand("start", "Start the bot");

export const startCommand = composer;
