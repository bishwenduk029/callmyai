import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite", // "mysql" | "sqlite" | "postgresql"
  schema: "./lib/db/schema.ts",
  out: "./lib/db/drizzle",
  dbCredentials: {
    url: process.env.DB_URL!
  }
});