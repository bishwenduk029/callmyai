import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().notNull(),
  content: text("content"), // Assuming CoreMessage has a content field
  createdAt: text("createdAt"), // Assuming CoreMessage has a createdAt field
});

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  createdAt: text("createdAt").notNull(),
  userId: text("userId").notNull(),
  path: text("path").notNull(),
  messages: text("messages", { mode: "json" }).$type<{ id: string, content: string, createdAt: string }[]>().notNull(),
  sharePath: text("sharePath"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  salt: text("salt").notNull(),
});
