import { Context } from "grammy";

import { db } from "../config/db";
import { redis } from "../config/redis";

type GuardResult = { ok: true } | { ok: false; message: string };

export async function requireAllowedTopic(ctx: Context): Promise<GuardResult> {
  if (!ctx.chat || !ctx.msg || !ctx.chat.is_forum) return { ok: true };

  const chatId = ctx.chat.id;
  const topicData = await db
    .selectFrom("chatGameTopics")
    .where("chatId", "=", chatId.toString())
    .selectAll()
    .execute();

  const topicIds = topicData.map((t) => t.topicId);
  const currentTopicId = ctx.msg.message_thread_id?.toString() || "general";

  if (topicData.length > 0 && !topicIds.includes(currentTopicId)) {
    return {
      ok: false,
      message:
        "This topic is not set for the game. Please play the game in the designated topic.",
    };
  }
  return { ok: true };
}

export async function requireAdmin(ctx: Context): Promise<GuardResult> {
  if (!ctx.chat || !ctx.from) return { ok: true };

  if (ctx.chat.type === "private") return { ok: true };

  try {
    const chatMember = await ctx.api.getChatMember(ctx.chat.id, ctx.from.id);

    const allowedStatus = ["administrator", "creator"];

    if (!allowedStatus.includes(chatMember.status)) {
      return {
        ok: false,
        message: "Only admins can use this command.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "⚠️ I couldn't verify admin rights.\n" +
        "👉 Please make sure I’m an admin in this group.",
    };
  }
}

type Guard = (ctx: Context) => Promise<GuardResult>;

export async function runGuards(
  ctx: Context,
  guards: Guard[],
): Promise<GuardResult> {
  for (const guard of guards) {
    const result = await guard(ctx);
    if (!result.ok) return result;
  }
  return { ok: true };
}

export const regularGameGuards = [requireAllowedTopic];

export const adminOnlyGuards = [requireAdmin];
