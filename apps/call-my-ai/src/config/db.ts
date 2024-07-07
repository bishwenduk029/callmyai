import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

import { env } from "@/env.mjs"
import * as schema from "@/db/schema"

const sql = postgres(env.DATABASE_URL)

export const db = drizzle(sql, { schema })
