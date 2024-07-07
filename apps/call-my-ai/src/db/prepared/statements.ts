import { eq, sql } from "drizzle-orm"

import { db } from "@/config/db"
import { chats, messages, newsletterSubscribers, users } from "@/db/schema"

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
  // @ts-ignore
  .set({ username: sql.placeholder("username") })
  .where(eq(users.id, sql.placeholder("id")))
  .prepare("psUpdateUserUsername")

export const psCheckExistingUsername = db
  .select({ id: users.id })
  .from(users)
  .where(
    sql`username = ${sql.placeholder("username")} AND id != ${sql.placeholder("id")}`
  )
  .limit(1)
  .prepare("psCheckExistingUsername")

export const psCreateChat = db
  .insert(chats)
  .values({
    userId: sql.placeholder("userId"),
    visitorId: sql.placeholder("visitorId"),
  })
  .returning({ id: chats.id })
  .prepare("psCreateChat")

export const psGetUserByUsername = db
  .select()
  .from(users)
  .where(eq(users.username, sql.placeholder("username")))
  .limit(1)
  .prepare("psGetUserByUsername")

export const psGetMessagesByChatId = db
  .select()
  .from(messages)
  .where(eq(messages.chatId, sql.placeholder("chatId")))
  .orderBy(messages.createdAt)
  .prepare("psGetMessagesByChatId")

export const psAddMessageToChat = db
  .insert(messages)
  .values({
    chatId: sql.placeholder("chatId"),
    content: sql.placeholder("content"),
  })
  .prepare("psAddMessageToChat")

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
  .where(eq(chats.userId, sql.placeholder("userId")))
  .prepare("psGetChatsByUserId")
