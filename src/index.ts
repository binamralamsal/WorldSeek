import { InputFile } from "grammy";

import { autoRetry } from "@grammyjs/auto-retry";
import { run, sequentialize } from "@grammyjs/runner";

import { bot } from "./config/bot";
import { commands } from "./commands";
import { errorHandler } from "./handlers/error-handler";
import { onMessageHander } from "./handlers/on-message";
import { CommandsHelper } from "./util/commands-helper";
import { callbackQueryHandler } from "./handlers/callback-query";
import { topicEditedHandler } from "./handlers/topic-edited-handler";
import { userAndChatSyncHandler } from "./handlers/user-and-chat-sync-handler";

bot.api.config.use(autoRetry());
bot.use(userAndChatSyncHandler);
bot.use(topicEditedHandler);

bot.use(
  sequentialize((ctx) => {
    if (ctx.callbackQuery) return undefined;
    if (ctx.chat?.type === "private") return undefined;

    return ctx.chatId?.toString() || ctx.from?.id.toString();
  }),
);

bot.use(commands);
bot.use(onMessageHander);
bot.use(callbackQueryHandler);

bot.catch(errorHandler);

run(bot);
console.log("Bot started");

await CommandsHelper.setCommands();
