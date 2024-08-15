"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { openai } from "@ai-sdk/openai"
import { CoreMessage, generateObject } from "ai"
import { z } from "zod"

import { env } from "@/env.mjs"
import {
  psCheckExistingUsername,
  psCreateChat,
  psGetChatsByUserId,
  psGetMessagesByChatId,
  psGetUserByEmail,
  psGetUserByEmailVerificationToken,
  psGetUserById,
  psGetUserByResetPasswordToken,
  psGetUserByUsername,
  psUpdateChatSummary,
  psUpdateUserCalls,
  psUpdateUserUsernameAndSystemPrompt,
} from "@/db/prepared/statements"
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

import { messages, User } from "../db/schema/index"
import { getUserSubscriptions } from "./payments"

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

export async function updateUserHandle(userId: string, formData: FormData) {
  const username = formData.get("username")?.toString()
  const systemPrompt = formData.get("systemPrompt")?.toString()

  if (!username) {
    return { error: "Username is required" }
  }

  try {
    // Check if username already exists
    const existingUser = await psCheckExistingUsername.execute({
      username,
      id: userId,
    })

    if (existingUser.length > 0) {
      return { error: "Username already taken" }
    }

    // Update username and systemPrompt
    await psUpdateUserUsernameAndSystemPrompt.execute({
      id: userId,
      username,
      systemPrompt,
    })

    revalidatePath("/settings")
    return { success: "Username and system prompt updated successfully" }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "An error occurred while updating user information" }
  }
}

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
  console.log("getUserByEmail")
  try {
    const validatedInput = getUserByEmailSchema.safeParse(rawInput)
    console.log(validatedInput)
    if (!validatedInput.success) return null

    const [user] = await psGetUserByEmail.execute({
      email: validatedInput.data.email,
    })
    console.log(user)
    return user || null
  } catch (error) {
    console.log("did something go wrong")
    console.log(error)
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

export async function updateUserCalls(
  userId: string | undefined,
  newCalls: number
) {
  try {
    await psUpdateUserCalls.execute({ id: userId, calls: newCalls })
    console.log(`Calls updated successfully for user ${userId}`)
  } catch (error) {
    console.error("Error updating username:", error)
    throw error
  }
}

export async function createChat(
  hostUsername: string,
  visitor: User
): Promise<{
  id: string
  userId: string
  prompt: string
  exhausted: boolean
  duration: number
}> {
  const hostResult =
    visitor.username === hostUsername
      ? [visitor]
      : await psGetUserByUsername.execute({
          username: hostUsername,
        })

  if (hostResult.length === 0) {
    throw new Error("Host user not found")
  }

  const host = hostResult[0]
  if (!host) {
    throw new Error("Invalid request from host")
  }
  if (visitor.id !== host.id) {
    if (host.calls !== null && host.calls <= 0) {
      return { id: "", userId: "", exhausted: true, duration: 0, prompt: "" }
    }
  }

  if (visitor.id == host.id) {
    return {
      exhausted: false,
      id: "dummy",
      userId: host.id,
      duration: 50,
      prompt: "",
    }
  }

  const [newChat] = await psCreateChat.execute({
    userId: host.id,
    visitorId: visitor.id,
  })

  if (visitor.id != host.id) {
    const visitorCalls = host?.calls || 0 - 1
    await updateUserCalls(host.id, visitorCalls)
  }

  if (!newChat) {
    throw new Error("Failed to create chat")
  }

  // Fetch user subscriptions
  const userSubscriptions = await getUserSubscriptions(newChat.userId)

  // Define a mapping of variantIds to durations
  const variantDurations: { [key: string]: number } = {
    "450525": 100,
    // Add more variants here in the future
  }

  // Determine the duration based on the subscription
  let duration = 100 // Default duration
  if (userSubscriptions.length > 0) {
    const variantId = userSubscriptions[0]?.variantId
    if (variantId && variantDurations[variantId]) {
      duration = variantDurations[variantId] || 100
    }
  }

  return { ...newChat, exhausted: false, duration, prompt: "" }
}

export async function getCallSummariesForUser(
  userId: string,
  page: number,
  pageSize: number
) {
  try {
    const offset = (page - 1) * pageSize
    // Fetch chat messages with pagination and order by most recent
    const chatMessages = await psGetChatsByUserId.execute({
      userId,
      limit: pageSize,
      offset: offset,
    })

    return {
      summaries: chatMessages,
      hasMore: chatMessages.length === pageSize,
    }
  } catch (error) {
    console.error("Error fetching chats for user:", error)
    throw new Error("Failed to fetch chats")
  }
}

export async function summarizeCall(
  chatId: string,
  chatTranscripts: CoreMessage[]
) {
  // Generate summary and title
  console.log(chatTranscripts)
  const { object } = await generateObject({
    model: openai(env.OPENAI_MODEL), // Make sure this matches your OpenAI model name
    schema: z.object({
      title: z.string(),
      summary: z.string(),
    }),
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...chatTranscripts,
    ],
  })

  console.log(object)

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
