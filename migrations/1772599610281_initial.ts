import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END
    $$;
  `.execute(db);

  await db.schema
    .createTable("users")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("username", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("leaderboard")
    .addColumn("id", "integer", (col) =>
      col.primaryKey().generatedByDefaultAsIdentity(),
    )
    .addColumn("user_id", "text", (col) =>
      col.references("users.id").onDelete("cascade").notNull(),
    )
    .addColumn("chat_id", "text", (col) => col.notNull())
    .addColumn("score", "integer", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("games")
    .addColumn("id", "integer", (col) =>
      col.primaryKey().generatedByDefaultAsIdentity(),
    )
    .addColumn("chat_id", "text", (col) => col.notNull())
    .addColumn("topic_id", "text", (col) => col.notNull())
    .addColumn("country_code", "varchar(2)", (col) => col.notNull())
    .addColumn("started_by", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("guesses")
    .addColumn("id", "integer", (col) =>
      col.primaryKey().generatedByDefaultAsIdentity(),
    )
    .addColumn("game_id", "integer", (col) =>
      col.references("games.id").onDelete("cascade").notNull(),
    )
    .addColumn("guess_code", "varchar(2)", (col) => col.notNull())
    .addColumn("distance_km", "integer", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE UNIQUE INDEX worldle_active_game_unique
    ON games (chat_id, topic_id);
  `.execute(db);

  await db.schema
    .createTable("chat_game_topics")
    .addColumn("chat_id", "text", (col) => col.notNull())
    .addColumn("topic_id", "text", (col) => col.notNull())
    .addColumn("name", "text")
    .addColumn("icon_custom_emoji_id", "text")
    .addColumn("should_recreate_on_expire", "boolean", (col) =>
      col.defaultTo(false).notNull(),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addPrimaryKeyConstraint("chat_game_topics_pkey", ["chat_id", "topic_id"])
    .execute();

  await sql`
    CREATE TRIGGER update_chat_game_topics_updated_at
    BEFORE UPDATE ON chat_game_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("broadcast_chats")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text")
    .addColumn("username", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await sql`
    CREATE TRIGGER update_broadcast_chats_updated_at
    BEFORE UPDATE ON broadcast_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);

  await db.schema
    .createTable("authorized_users")
    .addColumn("id", "integer", (col) =>
      col.primaryKey().generatedAlwaysAsIdentity(),
    )
    .addColumn("chat_id", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) => col.notNull())
    .addColumn("authorized_by", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("unique_chat_user", ["chat_id", "user_id"])
    .execute();

  await sql`
    CREATE INDEX authorized_users_chat_id_user_id_idx
    ON authorized_users(chat_id, user_id);
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("guesses").ifExists().execute();
  await db.schema.dropTable("games").ifExists().execute();
  await db.schema.dropTable("leaderboard").ifExists().execute();
  await db.schema.dropTable("chat_game_topics").ifExists().execute();
  await db.schema.dropTable("users").ifExists().execute();
  await db.schema.dropTable("broadcast_chats").ifExists().execute();
  await db.schema.dropTable("authorized_users").ifExists().execute();

  await sql`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;`.execute(
    db,
  );
}
