import { Composer, InlineKeyboard } from "grammy";

import { env } from "../config/env";
import { CommandsHelper } from "../util/commands-helper";
import { DISCUSSION_GROUP, UPDATES_CHANNEL } from "../config/constants";

const composer = new Composer();

type HelpSection = "howto" | "scores" | "group" | "admin";

export function formatActiveButton(label: string, active: boolean) {
  return active ? `« ${label} »` : label;
}

export function getMainHelpKeyboard(
  shouldShowAdmin: boolean,
  active: HelpSection = "howto",
) {
  const keyboard = new InlineKeyboard()
    .text(formatActiveButton("How to Play", active === "howto"), "help_howto")
    .style(active == "howto" ? "primary" : undefined)
    .text(
      formatActiveButton("Leaderboard & Scores", active === "scores"),
      "help_scores",
    )
    .style(active == "scores" ? "primary" : undefined)
    .row()
    .text(
      formatActiveButton("Group Settings", active === "group"),
      "help_group",
    )
    .style(active == "group" ? "primary" : undefined)
    .url("GitHub Repo", "https://github.com/binamralamsal/WorldSeek");

  if (shouldShowAdmin) {
    keyboard
      .row()
      .text(
        formatActiveButton("👑 Admin Commands", active === "admin"),
        "help_admin",
      )
      .style(active == "admin" ? "primary" : undefined);
  }

  keyboard.row().url("📢 Updates", UPDATES_CHANNEL);
  keyboard.url("💬 Discussion", DISCUSSION_GROUP);

  return keyboard;
}

export function getHowToPlayMessage() {
  return `<b>▸ How to Play WorldSeek</b>

<blockquote>1. Start a game using <code>/newworld</code>
2. The bot will send a silhouette map of a random country
3. Guess which country it is by sending the country name
4. After each guess, the bot will show the distance between your guess and the correct country
5. Use the distance hints to narrow down your guesses
6. The first person to guess the correct country wins the game
7. The winner receives <b>10 points</b></blockquote>

<b>Distance Hint System</b>
<blockquote>Each incorrect guess returns the distance between your guessed country and the correct one.

Example:
Guess: <i>India</i>
Distance: <b>1,250 km</b>

Closer guesses mean you are geographically closer to the correct country.
Use this information to refine your next guess.</blockquote>

<b>Basic Commands</b>
- /newworld — Start a new WorldSeek game
- /endworld — End the current game (voting or admin only)
- /leaderboard — Show leaderboard rankings
- /score — Show your score or another user's score
- /help — Show this help menu

<b>Tips</b>
<blockquote>- Look carefully at the silhouette shape
- Use the distance hints to guide your next guess
- Try nearby countries if your guess is close
- Geography knowledge helps a lot</blockquote>`;
}

export function getScoresMessage() {
  return `<b>▸ Leaderboard & Scores</b>

<b>Quick Examples:</b>
<blockquote><code>/leaderboard</code> - Group leaderboard
<code>/leaderboard global</code> - Global leaderboard

<code>/score</code> - Your score in the current group
<code>/score @username</code> - View another user's score
<code>/score 123456789</code> - View score by user ID
<code>/score global</code> - Your global score</blockquote>

<b>Leaderboard Command</b>
<blockquote><b>Syntax:</b> <code>/leaderboard [scope]</code>

<b>Scope:</b>
• <code>group</code> (default) - Current group only  
• <code>global</code> - All groups combined</blockquote>

<b>Score Command</b>
<blockquote><b>Syntax:</b> <code>/score [target] [scope]</code>

<b>Target (optional):</b>
• Leave empty for your own score  
• <code>@username</code> - Look up by username  
• <code>user_id</code> - Look up by Telegram user ID</blockquote>`;
}

export function getGroupSettingsMessage() {
  return `<b>▸ Group Settings (Admin Only)</b>

<b>Authorized Users</b>
<blockquote><b>/worldauth</b> – Manage users who can end games without a vote.

<b>Usage:</b>
• <code>/worldauth @username</code> – Authorize a user  
• <code>/worldauth remove @username</code> – Remove authorization  
• <code>/worldauth list</code> – List all authorized users

You can also use a user ID or reply to a message instead of @username.</blockquote>

<b>Game Topic (Forum Groups)</b>
<blockquote><b>/setgametopic</b> – Restrict games to specific topics  
Run this command <i>inside the topic</i> where you want games to run.

After setting, the bot will only allow games inside configured topics.

<b>/unsetgametopic</b> – Remove topic restriction  
Usage: <code>/unsetgametopic</code>

After removing the restriction, games can run in any topic again.</blockquote>`;
}

export function getAdminCommandsMessage() {
  return `<b>▸ Admin Commands (Bot Owner Only)</b>

<blockquote><b>/stats</b>
View bot statistics including:
• Total users and groups
• CPU usage
• Memory usage
• Bot performance</blockquote>`;
}

composer.command("help", async (ctx) => {
  if (!ctx.from) return;

  const shouldShowAdmin =
    env.ADMIN_USERS.includes(ctx.from.id) && ctx.chat.type === "private";

  const keyboard = getMainHelpKeyboard(shouldShowAdmin, "howto");

  await ctx.reply(getHowToPlayMessage(), {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
});

CommandsHelper.addNewCommand(
  "help",
  "Get help on how to play WorldSeek and commands list",
);

export const helpCommand = composer;
