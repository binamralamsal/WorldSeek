import type { AllowedChatSearchKey } from "../types";
import { escapeHtmlEntities } from "./escape-html-entities";

type FormatUserScoreData = {
  totalScore: number;
  rank: number;
  name: string;
  username: string | null;
};

export function formatUserScoreMessage(
  data: FormatUserScoreData,
  searchKey: AllowedChatSearchKey,
) {
  const name = escapeHtmlEntities(data.name);
  const mentionLink = data.username
    ? `<a href="https://t.me/${data.username}">${name}</a>`
    : name;

  const scopeLabel = searchKey === "global" ? "Globally" : "In This Chat";
  const totalScore = data.totalScore.toLocaleString();
  const rank = data.rank.toLocaleString();

  return `
<blockquote>🏆 ${mentionLink}'s Performance ${scopeLabel} 🏆</blockquote>

📊 Total Score: <b>${totalScore}</b>
🏅 Rank: <b>#${rank}</b>
`.trim();
}
