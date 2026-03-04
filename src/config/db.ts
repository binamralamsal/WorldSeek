import pg from "pg";
import {
  CamelCasePlugin,
  DeduplicateJoinsPlugin,
  Kysely,
  PostgresDialect,
} from "kysely";

import { env } from "./env";
import type { DB } from "../database-schemas";

const { Pool } = pg;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  }),
});

export const db = new Kysely<DB>({
  dialect,
  log: (event) => {
    if (env.NODE_ENV === "development") {
      if (event.level === "query") {
        console.log("SQL:", event.query.sql);
        console.log("Parameters:", event.query.parameters);
      } else {
        console.error("Error:", event.error);
      }
      console.log("-------------");
    }
  },
  plugins: [new CamelCasePlugin(), new DeduplicateJoinsPlugin()],
});
