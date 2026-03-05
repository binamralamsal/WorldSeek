import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TYPE game_mode AS ENUM ('map', 'flag')`.execute(db);

  await db.schema
    .alterTable("games")
    .addColumn("mode", sql`game_mode`, (col) => col.notNull().defaultTo("map"))
    .execute();

  await db.schema
    .alterTable("leaderboard")
    .addColumn("mode", sql`game_mode`, (col) => col.notNull().defaultTo("map"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("games").dropColumn("mode").execute();
  await db.schema.alterTable("leaderboard").dropColumn("mode").execute();

  await sql`DROP TYPE IF EXISTS game_mode`.execute(db);
}
