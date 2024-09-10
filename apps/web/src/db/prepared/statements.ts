import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm"

import { db } from "@/config/db"
import { assistants, chats, newsletterSubscribers, users } from "@/db/schema"

export const psGetUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("psGetUserById")

export const psGetUserByEmail = db
  .select()
  .from(users)
  .where(eq(users.email, sql.placeholder("email")))
  .prepare("psGetUserByEmail")

export const psGetUserByEmailVerificationToken = db
  .select()
  .from(users)
  .where(eq(users.emailVerificationToken, sql.placeholder("token")))
  .prepare("psGetUserByEmailVerificationToken")

export const psGetUserByResetPasswordToken = db
  .select()
  .from(users)
  .where(eq(users.resetPasswordToken, sql.placeholder("token")))
  .prepare("psGetUserByResetPasswordToken")

export const psGetNewsletterSubscriberByEmail = db
  .select()
  .from(newsletterSubscribers)
  .where(eq(newsletterSubscribers.email, sql.placeholder("email")))
  .prepare("psGetNewsletterSubscriberByEmail")

export const psLinkOAuthAccount = db
  .update(users)
  .set({ emailVerified: new Date() })
  .where(eq(users.id, sql.placeholder("userId")))
  .prepare("psLinkOAuthAccount")

export const psUpdateUserUsername = db
  .update(users)
  .set({
    name: sql`${sql.placeholder("name")}`,
  })
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("psUpdateUserUsernameAndSystemPrompt")

export const psUpdateUserCallHandle = db
  .update(users)
  .set({
    username: sql`${sql.placeholder("username")}`,
  })
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("psUpdateUserUsernameAndSystemPrompt")

export const psUpdateUserCalls = db
  .update(users)
  // @ts-ignore
  .set({ calls: sql.placeholder("calls") })
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("psUpdateUserCalls")

export const psCheckExistingUsername = db
  .select({ id: users.id })
  .from(users)
  .where(
    sql`username = ${sql.placeholder("username")} AND id = ${sql.placeholder("id")}`
  )
  .limit(1)
  .prepare("psCheckExistingUsername")

export const psCreateChat = db
  .insert(chats)
  .values({
    userId: sql.placeholder("userId"),
    visitorId: sql.placeholder("visitorId"),
  })
  .returning({ id: chats.id, userId: chats.userId })
  .prepare("psCreateChat")

export const psGetUserByUsername = db
  .select()
  .from(users)
  .where(eq(users.username, sql.placeholder("username")))
  .limit(1)
  .prepare("psGetUserByUsername")

export const psUpdateChatSummary = db
  .update(chats)
  .set({
    // @ts-ignore
    summary: sql.placeholder("summary"),
    // @ts-ignore
    title: sql.placeholder("title"),
  })
  .where(sql`id = ${sql.placeholder("chatId")}`)
  .prepare("psUpdateChatSummary")

export const psGetChatsByUserId = db
  .select()
  .from(chats)
  .where(
    and(
      eq(chats.userId, sql.placeholder("userId")),
      ne(chats.userId, chats.visitorId),
      isNotNull(chats.summary),
      isNotNull(chats.title)
    )
  )
  .orderBy(desc(chats.createdAt))
  .limit(sql.placeholder("limit"))
  .offset(sql.placeholder("offset"))
  .prepare("psGetChatsByUserId")

export const psGetUserByAssistantId = db
  .select()
  .from(assistants)
  .innerJoin(users, eq(assistants.userId, users.id))
  .where(eq(assistants.id, sql.placeholder("assistantId")))
  .limit(1)
  .prepare("psGetUserByAssistantId")

export const psCreateChatForAssistant = db
  .insert(chats)
  .values({
    userId: sql.placeholder("userId"),
    visitorId: sql.placeholder("visitorId"),
    assistantId: sql.placeholder("assistantId"),
  })
  .returning({
    id: chats.id,
    userId: chats.userId,
    assistantId: chats.assistantId,
  })
  .prepare("psCreateChatForAssistant")

export const psCreateAssistant = db
  .insert(assistants)
  .values({
    id: sql.placeholder("id"),
    name: sql.placeholder("name"),
    duration: sql.placeholder("duration"),
    userId: sql.placeholder("userId"),
  })
  .returning()
  .prepare("psCreateAssistant")

export const psUpdateAssistant = db
  .update(assistants)
  .set({
    name: sql<string>`${sql.placeholder("name")}`,
    duration: sql<number>`${sql.placeholder("duration")}`,
  })
  .where(eq(assistants.id, sql.placeholder("id")))
  .returning()
  .prepare("psUpdateAssistant")

export const psDeleteAssistant = db
  .delete(assistants)
  .where(eq(assistants.id, sql.placeholder("id")))
  .returning()
  .prepare("psDeleteAssistant")

export const psGetAssistantsByUserId = db
  .select()
  .from(assistants)
  .where(eq(assistants.userId, sql.placeholder("userId")))
  .prepare("psGetAssistantsByUserId")

export const psGetChatsByAssistantId = db
  .select()
  .from(chats)
  .where(eq(chats.assistantId, sql.placeholder("assistantId")))
  .limit(sql.placeholder("limit"))
  .offset(sql.placeholder("offset"))
  .orderBy(desc(chats.createdAt))
  .prepare("psGetChatsByAssistantId")

export const psGetAssistantById = db
  .select()
  .from(assistants)
  .where(eq(assistants.id, sql.placeholder("assistantId")))
  .prepare("psGetAssistantById")
