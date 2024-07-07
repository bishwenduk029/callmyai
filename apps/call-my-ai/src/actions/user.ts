"use server"

import { unstable_noStore as noStore } from "next/cache"
import { openai } from "@ai-sdk/openai"
import { generateObject, streamObject } from "ai"
import { z } from "zod"

import {
  psCreateChat,
  psGetChatsByUserId,
  psGetMessagesByChatId,
  psGetUserByEmail,
  psGetUserByEmailVerificationToken,
  psGetUserById,
  psGetUserByResetPasswordToken,
  psGetUserByUsername,
  psUpdateChatSummary,
  psUpdateUserUsername,
} from "@/db/prepared/statements"
import { type User } from "@/db/schema"
import {
  getUserByEmailSchema,
  getUserByEmailVerificationTokenSchema,
  getUserByIdSchema,
  getUserByResetPasswordTokenSchema,
  type GetUserByEmailInput,
  type GetUserByEmailVerificationTokenInput,
  type GetUserByIdInput,
  type GetUserByResetPasswordTokenInput,
} from "@/validations/user"

const systemPrompt = `
  You are an expert conversation analyst and summarizer. Your task is to create a brief, engaging summary of a conversation between an AI assistant and a caller. This summary should be easily digestible and help the user quickly determine the call's relevance and importance.

Follow these guidelines:

1. Title:
   - Create a catchy, attention-grabbing title (max 50 characters)
   - Incorporate key topics or themes from the conversation
   - Use wordplay, alliteration, or puns if appropriate

2. Summary:
   - Limit the summary to 280 characters (tweet length)
   - Capture the essence of the conversation
   - Highlight the most important points or requests
   - Include any action items or follow-ups needed
   - Use concise language and relevant hashtags

3. Key Elements to Include:
   - Caller's main purpose or request
   - Any specific details (e.g., property information, business proposal)
   - Urgency level of the call
   - Potential value or relevance to the user
   - Any red flags or unusual aspects of the conversation

4. Tone and Style:
   - Match the tone to the content (professional for business calls, casual for personal)
   - Use active voice and strong verbs
   - Incorporate relevant emojis sparingly to convey tone or topic

5. Formatting:
   - Use bullet points or brief sentences
   - Include relevant names, numbers, or dates in a easily scannable format

Remember, your goal is to create a summary that allows the user to quickly grasp the conversation's content and decide on any necessary actions.

Based on the conversation transcript provided, generate a title and summary following these guidelines.
  `

export async function getUserById(
  rawInput: GetUserByIdInput
): Promise<User | null> {
  try {
    const validatedInput = getUserByIdSchema.safeParse(rawInput)
    if (!validatedInput.success) return null

    noStore()
    const [user] = await psGetUserById.execute({ id: validatedInput.data.id })
    return user || null
  } catch (error) {
    console.error(error)
    throw new Error("Error getting user by id")
  }
}

export async function getUserByEmail(
  rawInput: GetUserByEmailInput
): Promise<User | null> {
  try {
    const validatedInput = getUserByEmailSchema.safeParse(rawInput)
    if (!validatedInput.success) return null

    noStore()
    const [user] = await psGetUserByEmail.execute({
      email: validatedInput.data.email,
    })
    return user || null
  } catch (error) {
    console.error(error)
    throw new Error("Error getting user by email")
  }
}

export async function getUserByResetPasswordToken(
  rawInput: GetUserByResetPasswordTokenInput
): Promise<User | null> {
  try {
    const validatedInput = getUserByResetPasswordTokenSchema.safeParse(rawInput)
    if (!validatedInput.success) return null

    noStore()
    const [user] = await psGetUserByResetPasswordToken.execute({
      token: validatedInput.data.token,
    })
    return user || null
  } catch (error) {
    console.error(error)
    throw new Error("Error getting user by reset password token")
  }
}

export async function getUserByEmailVerificationToken(
  rawInput: GetUserByEmailVerificationTokenInput
): Promise<User | null> {
  try {
    const validatedInput =
      getUserByEmailVerificationTokenSchema.safeParse(rawInput)
    if (!validatedInput.success) return null

    noStore()
    const [user] = await psGetUserByEmailVerificationToken.execute({
      token: validatedInput.data.token,
    })
    return user || null
  } catch (error) {
    console.error(error)
    throw new Error("Error getting user by email verification token")
  }
}

export async function updateUsername(
  userId: string | undefined,
  newUsername: string
) {
  try {
    await psUpdateUserUsername.execute({ id: userId, username: newUsername })
    console.log(`Username updated successfully for user ${userId}`)
  } catch (error) {
    console.error("Error updating username:", error)
    throw error
  }
}

export async function createChat(hostUsername: string, visitorId: string) {
  const hostResult = await psGetUserByUsername.execute({
    username: hostUsername,
  })

  if (hostResult.length === 0) {
    throw new Error("Host user not found")
  }

  const host = hostResult[0]
  if (!host) {
    throw new Error("invalid request from host")
  }
  const newChat = await psCreateChat.execute({
    userId: host.id,
    visitorId: visitorId,
  })

  return newChat[0]
}

export async function getChatsForUser(userId: string) {
  // Fetch chat messages
  const chatMessages = await psGetChatsByUserId.execute({
    userId,
  })

  return chatMessages
}

export async function summarizeCall(chatId: string) {
  // Fetch chat messages
  const chatMessages = await psGetMessagesByChatId.execute({
    chatId,
  })

  // Parse messages
  const parsedMessages = chatMessages.map((msg) => {
    try {
      return JSON.parse(msg.content)
    } catch (error) {
      console.error(`Failed to parse message content: ${msg.content}`)
      return { role: "system", content: "Error: Could not parse message" }
    }
  })

  // Generate summary and title
  const { object } = await generateObject({
    model: openai("gpt-4"), // Make sure this matches your OpenAI model name
    schema: z.object({
      title: z.string(),
      summary: z.string(),
    }),
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...parsedMessages,
    ],
  })

  // Update the chat with the generated summary and title
  try {
    await psUpdateChatSummary.execute({
      chatId,
      summary: object.summary,
      title: object.title,
      updatedAt: new Date(),
    })

    console.debug(`Chat ${chatId} updated with summary and title`)
    return {
      success: true,
      chatId,
      title: object.title,
      summary: object.summary,
    }
  } catch (error) {
    console.error(`Failed to update chat ${chatId} with summary:`, error)
    return { success: false, error: "Failed to update chat summary" }
  }
}
