import { drizzle } from 'drizzle-orm/bun-sqlite';
import Database from 'better-sqlite3';

const sqlite = new Database(process.env.DB_URL!);
export const db = drizzle(sqlite);