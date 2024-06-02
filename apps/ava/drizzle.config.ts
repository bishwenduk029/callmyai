import { Config, defineConfig } from "drizzle-kit";

export default {
  dialect: "sqlite", // "mysql" | "sqlite" | "postgresql"
  driver: "turso",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/drizzle",
  dbCredentials: {
    url: "libsql://ava-db-bishwenduk029.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTY3OTY3ODEsImlkIjoiYWY0ZGQ0ZTAtZjkxMS00OTdhLTljODUtNmQzMzViYTNhYzM3In0.MI98oR6gB57y6eFP8NMbNRMTz2QXS-3nW-k4UrlpE-LxFu8h3_GEhyhTt1iDpggSNwCbvQXM79QYt5Vp3CM0AQ"
  }
} satisfies Config;