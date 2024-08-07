import "dotenv/config";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

import { env } from "@/env.mjs";

const connectionString = env.DATABASE_URL;

const drizzleClient = drizzle(
  postgres(connectionString, {
    prepare: false,
  }),
  { schema },
);

declare global {
  var database: PostgresJsDatabase<typeof schema> | undefined;
}

export const db = global.database || drizzleClient;
if (process.env.NODE_ENV !== "production") global.database = db;
