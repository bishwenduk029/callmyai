import type { AdapterAccount } from "@auth/core/adapters"
import { relations } from "drizzle-orm"
import {
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"])

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    handle: text("handle").unique(),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// Modified chats table
export const chats = pgTable("chat", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  visitorId: text("visitorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  summary: text("summary"),
  title: text("title"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
})

// Modified chatsRelations
export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
    relationName: "userChats",
  }),
  visitor: one(users, {
    fields: [chats.visitorId],
    references: [users.id],
    relationName: "visitorChats",
  }),
  messages: many(messages),
}))

// New messages table
export const messages = pgTable("message", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

// New messagesRelations
export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}))

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  role: userRoleEnum("role").notNull().default("USER"),
  name: text("name"),
  surname: text("surname"),
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  emailVerificationToken: text("emailVerificationToken").unique(),
  passwordHash: text("passwordHash"),
  resetPasswordToken: text("resetPasswordToken").unique(),
  resetPasswordTokenExpiry: timestamp("resetPasswordTokenExpiry", {
    mode: "date",
  }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
  session: many(sessions),
  userChats: many(chats, {
    relationName: "userChats",
  }),
  visitorChats: many(chats, {
    relationName: "visitorChats",
  }),
}))

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const newsletterSubscribers = pgTable("newsletterSubscriber", {
  email: text("email").notNull().primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert
