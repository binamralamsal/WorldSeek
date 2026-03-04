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
<blockquote>
1. Start a game using <code>/newworld</code>  
2. The bot sends a silhouette map of a random country  
3. Guess the country by sending its name in chat  
4. After each guess, the bot shows how far your guess is from the correct country  
5. Use the distance, direction arrows, and hints to narrow it down  
6. The first person to guess correctly wins the game  
7. The winner receives <b>10 points</b>  
8. Each game allows a maximum of <b>20 guesses</b>
</blockquote>
<b>Distance & Direction</b><blockquote>
Each guess shows how far your country is from the correct one.

Example  
Brazil — <b>4200 km ↗</b>

The arrow shows the direction of the correct country:
↑ North  
↓ South  
→ East  
← West  
↗ ↘ ↖ ↙ Diagonal directions
</blockquote>
<b>Neighbor Hint</b><blockquote>
If your guess shares a border with the correct country, the bot will show:

<b>🟢 Neighbor</b>

This means the correct country directly borders your guess.
</blockquote>
<b>Progressive Hints</b><blockquote>
As the game continues, extra hints will appear:

After 5 guesses — UN membership  
After 10 guesses — Driving side (left/right)  
After 12 guesses — Continent  
After 14 guesses — First day of the week

Use these hints to help narrow down the correct country before the <b>20 guess limit</b>.
</blockquote>
<b>Basic Commands</b>
• /newworld — Start a new WorldSeek game  
• /endworld — End the current game (admin or vote)  
• /leaderboard — Show top players  
• /score — Show your score or another user's score  
• /help — Show this help message
<b>Tips</b>
<blockquote>
• Study the silhouette carefully  
• Use direction arrows to move your guesses closer  
• A "Neighbor" guess means you're very close  
• Think geographically — continents and regions help a lot
</blockquote>`;
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
