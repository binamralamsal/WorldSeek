import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("chat_game_topics")
    .addColumn("allowed_modes", sql`game_mode[]`, (col) =>
      col.defaultTo(sql`ARRAY['map','flag']::game_mode[]`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("chat_game_topics")
    .dropColumn("allowed_modes")
    .execute();
}
