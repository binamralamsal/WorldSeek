import { Composer } from "grammy";

import { helpCommand } from "./help";
import { scoreCommand } from "./score";
import { startCommand } from "./start";
import { statsCommand } from "./stats";
import { banCommand } from "./ban-user";
import { newFlagCommand } from "./new-flag";
import { unbanCommand } from "./unban-user";
import { endWorldCommand } from "./end-world";
import { newWorldCommand } from "./new-world";
import { worldAuthCommand } from "./worldauth";
import { leaderboardCommand } from "./leaderboard";
import { setGameTopicCommand } from "./setgametopic";
import { allowOnlyModeCommand } from "./allowonlymode";
import { recreateTopicCommand } from "./recreatetopic";
import { unsetGameTopicCommand } from "./unsetgametopic";

const composer = new Composer();

composer.use(
  newWorldCommand,
  newFlagCommand,
  endWorldCommand,
  statsCommand,
  setGameTopicCommand,
  worldAuthCommand,
  unsetGameTopicCommand,
  leaderboardCommand,
  scoreCommand,
  helpCommand,
  startCommand,
  banCommand,
  unbanCommand,
  allowOnlyModeCommand,
  recreateTopicCommand,
);

export const commands = composer;
