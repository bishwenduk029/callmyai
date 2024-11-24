import type { AdapterAccount } from "@auth/core/adapters"
import { all } from "axios"
import { InferModel, relations, sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
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
    phoneNumber: text("phoneNumber"),
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
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessions = pgTable(
  "session",
  {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// Modified chats table
export const chats = pgTable(
  "chat",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
    assistantId: text("assistantId").references(() => assistants.id, {
      onDelete: "cascade",
    }),
    visitorId: text("visitorId").references(() => users.id, {
      onDelete: "cascade",
    }),
    summary: text("summary"),
    title: text("title"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    systemPromptOverride: text("systemPromptOverride"),
  },
  (chat) => ({
    userIdIdx: index("chat_userId_idx").on(chat.userId),
    assistantIdIdx: index("chat_assistantId_idx").on(chat.assistantId),
    visitorIdIdx: index("chat_visitorId_idx").on(chat.visitorId),
  })
)

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
    relationName: "userChats",
  }),
  assistant: one(assistants, {
    fields: [chats.assistantId],
    references: [assistants.id],
    relationName: "assistantChats",
  }),
  visitor: one(users, {
    fields: [chats.visitorId],
    references: [users.id],
    relationName: "visitorChats",
  }),
}))

export const users = pgTable(
  "user",
  {
    id: text("id").notNull().primaryKey(),
    role: userRoleEnum("role").notNull().default("USER"),
    name: text("name"),
    phone: text("phone"),
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
    calls: integer("calls").default(50),
  },
  (user) => ({
    emailIdx: index("user_email_idx").on(user.email),
    usernameIdx: index("user_username_idx").on(user.username),
  })
)

export const assistants = pgTable(
  "assistant",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    phoneNumber: text("phoneNumber"),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    callLimit: integer("callLimit").default(50).notNull(),
  },
  (assistant) => ({
    idIdx: index("assistant_id_idx").on(assistant.id),
    userIdIdx: index("assistant_userId_idx").on(assistant.userId),
  })
)

export const assistantsRelations = relations(assistants, ({ one, many }) => ({
  user: one(users, {
    fields: [assistants.userId],
    references: [users.id],
  }),
  assistantChats: many(chats, {
    relationName: "assistantChats",
  }),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
  session: many(sessions),
  assistants: many(assistants),
  userChats: many(chats, {
    relationName: "userChats",
  }),
  visitorChats: many(chats, {
    relationName: "visitorChats",
  }),
  integrations: many(integrations),
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
    identifierIdx: index("verificationToken_identifier_idx").on(vt.identifier),
    tokenIdx: index("verificationToken_token_idx").on(vt.token),
  })
)

export const newsletterSubscribers = pgTable("newsletterSubscriber", {
  email: text("email").notNull().primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

// Change webhookEvents table
export const webhookEvents = pgTable("webhookEvent", {
  id: serial(), // instead of serial
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  eventName: text("eventName").notNull(),
  processed: boolean("processed").default(false),
  body: jsonb("body").notNull(),
  processingError: text("processingError"),
})

export const plans = pgTable("plan", {
  id: text("id").notNull().primaryKey(),
  productId: integer("productId").notNull(),
  productName: text("productName"),
  variantId: integer("variantId"),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  isUsageBased: boolean("isUsageBased").default(false),
  interval: text("interval"),
  intervalCount: integer("intervalCount"),
  trialInterval: text("trialInterval"),
  trialIntervalCount: integer("trialIntervalCount"),
  sort: integer("sort"),
  allowedDuration: integer("duration"),
  allowedApps: integer("allowedApps").default(0),
  allowedFiles: integer("allowedFiles").default(0),
  allowedCalls: integer("allowedCalls").default(0),
  allowedAssistants: integer("allowedAssistants").default(0),
})

export const subscriptions = pgTable("subscription", {
  id: serial(),
  lemonSqueezyId: text("lemonSqueezyId"),
  orderId: integer("orderId").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  status: text("status", { enum: ["ACTIVE", "CANCELLED"] })
    .notNull()
    .default("ACTIVE"),
  statusFormatted: text("statusFormatted").notNull(),
  renewsAt: text("renewsAt"),
  endsAt: text("endsAt"),
  trialEndsAt: text("trialEndsAt"),
  price: text("price").notNull(),
  planId: text("planId").references(() => plans.id), // Optional reference to plan
  isUsageBased: boolean("isUsageBased").default(false),
  isPaused: boolean("isPaused").default(false),
  // Direct limits stored in subscription
  allowedDuration: integer("duration").notNull().default(75),
  allowedApps: integer("allowedApps").notNull().default(5),
  allowedFiles: integer("allowedFiles").notNull().default(5),
  allowedCalls: integer("allowedCalls").notNull().default(200),
  allowedAssistants: integer("allowedAssistants").notNull().default(3),
  userId: text("userId")
    .notNull()
    .references(() => users.id)
})

// Modify subscriptions relations to make plan optional
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}))

export const promptTemplates = pgTable("promptTemplate", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
})

// Add this new table for integrations
export const integrations = pgTable(
  "integration",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    connectedAccountName: text("connectedAccountName").notNull(),
    appId: text("appId").notNull(),
    key: text("key").notNull(),
    description: text("description"),
    logo: text("logo"),
    availableActions: text("availableActions").array().default([]),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (integration) => ({
    userIdIdx: index("integration_userId_idx").on(integration.userId),
    appIdIdx: index("integration_appId_idx").on(integration.appId),
  })
)

// Add this new relation
export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, {
    fields: [integrations.userId],
    references: [users.id],
  }),
}))

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

export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert

export type PromptTemplate = typeof promptTemplates.$inferSelect
export type NewPromptTemplate = typeof promptTemplates.$inferInsert

export type NewPlan = typeof plans.$inferInsert
export type NewWebhookEvent = typeof webhookEvents.$inferInsert
export type NewSubscription = typeof subscriptions.$inferInsert

export type Integration = typeof integrations.$inferSelect
export type NewIntegration = typeof integrations.$inferInsert

export type Assistant = typeof assistants.$inferSelect
