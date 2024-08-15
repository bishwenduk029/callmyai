import postgres from 'postgres';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';

import { env } from "@/env.mjs"
import * as schema from "@/db/schema"

const drizzleClient = drizzle(
  postgres(env.DATABASE_URL, {
    prepare: false,
  }),
  { schema }
);

declare global {
  var database: PostgresJsDatabase<typeof schema> | undefined;
}

export const db = global.database || drizzleClient;
if (process.env.NODE_ENV !== "production") global.database = db;
