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
  psGetUserByAssistantId,
  psGetUserByEmail,
  psGetUserByEmailVerificationToken,
  psGetUserById,
  psGetUserByResetPasswordToken,
  psGetUserByUsername,
  psUpdateChatSummary,
  psUpdateUserCallHandle,
  psUpdateUserCalls,
  psUpdateUserUsername,
} from "@/db/prepared/statements"
import {
  getUserByAssistantIdSchema,
  getUserByEmailSchema,
  getUserByEmailVerificationTokenSchema,
  getUserByIdSchema,
  getUserByResetPasswordTokenSchema,
  GetUserByUsernameInput,
  getUserByUsernameSchema,
  type GetUserByAssistantIdInput,
  type GetUserByEmailInput,
  type GetUserByEmailVerificationTokenInput,
  type GetUserByIdInput,
  type GetUserByResetPasswordTokenInput,
} from "@/validations/user"

import { actionClient } from "@/lib/safe-action"

import { ChatRoomSession } from "@/components/audio/chat-room"

import { User } from "../db/schema/index"
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

interface UpdateUserDetailsResult {
  message: string
}

const userCallHandleSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Username must be at least 4 characters long." }),
  id: z.string(),
})

export const updateUserByCallHandle = actionClient
  .schema(userCallHandleSchema)
  .action(async ({ parsedInput: { username, id } }) => {
    try {
      // Check if username already exists
      const existingUser = await psCheckExistingUsername.execute({
        username: username,
        id: id,
      })

      if (existingUser.length > 0) {
        return { error: "Username already taken" }
      }

      // Update username and systemPrompt
      await psUpdateUserCallHandle.execute({
        username: username,
        id: id,
      })

      revalidatePath("/settings")
      return { message: "Username updated successfully" }
    } catch (error) {
      console.error("Error updating user:", error)
      return { message: "An error occurred while updating user information" }
    }
  })

const usernameSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Username must be at least 4 characters long." }),
  id: z.string(),
})

export const updateUserByUsername = actionClient
  .schema(usernameSchema)
  .action(async ({ parsedInput: { name, id } }) => {
    try {
      // Update username and systemPrompt
      await psUpdateUserUsername.execute({
        name,
        id: id,
      })

      revalidatePath("/settings")
      return { message: "Username updated successfully" }
    } catch (error) {
      console.error("Error updating user:", error)
      return { error: "An error occurred while updating user information" }
    }
  })

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

export async function getUserByUsername(
  rawInput: GetUserByUsernameInput
): Promise<User | null> {
  try {
    const validatedInput = getUserByUsernameSchema.safeParse(rawInput)
    if (!validatedInput.success) return null

    const [user] = await psGetUserByUsername.execute({
      username: validatedInput.data.username,
    })
    return user || null
  } catch (error) {
    console.error(error)
    throw new Error("Error getting user by username")
  }
}

export const getUserByEmail = actionClient
  .schema(getUserByEmailSchema)
  .action(async ({ parsedInput: { email } }): Promise<User | null> => {
    try {
      const [user] = await psGetUserByEmail.execute({ email })
      return user || null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  })

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
  } catch (error) {
    console.error("Error updating username:", error)
    throw error
  }
}

export async function createNewChatSession(
  hostUsername: string,
  visitor: User | null | undefined
): Promise<ChatRoomSession> {
  const hostResult =
    visitor?.username === hostUsername
      ? [visitor]
      : await psGetUserByUsername.execute({
          username: hostUsername,
        })

  if (hostResult.length === 0) {
    throw new Error("callmyai user handle does not exist")
  }

  const host = hostResult[0]
  if (!host) {
    throw new Error("Invalid request from host")
  }

  const systemPrompt = env.SYSTEM_PROMPT?.replace(/\${name}/g, host.name!)

  if (visitor?.id == host.id) {
    return {
      baseUrl: "/api/bots/start",
      exhausted: false,
      duration: 50,
      userPrompt: `Remember this is test simulation to understand if the system propmpt will work as per user's needs. So greet the user with 'Hey ${host.name} welcome to simulation, shall we test if I meet your expectations'. Guide the user to act as a caller and simulate some scenario to verify if the prompt set by them is working as per expectation. Below is the prompt set by user\n${systemPrompt}`,
      private: true,
      userName: hostUsername || "",
    }
  }

  if (visitor?.id !== host.id) {
    if (host.calls !== null && host.calls <= 0) {
      return {
        baseUrl: "/api/bots/start",
        exhausted: true,
        duration: 0,
        userPrompt: "",
        private: false,
        userName: hostUsername || "",
      }
    }
  }

  if (visitor?.id != host.id) {
    const visitorCalls = host?.calls || 0 - 1
    await updateUserCalls(host.id, visitorCalls)
  }

  // Fetch user subscriptions
  const userSubscriptions = await getUserSubscriptions(host.id)

  // Define a mapping of variantIds to durations
  const variantDurations: { [key: string]: number } = {
    "450525": 75,
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

  return {
    baseUrl: "/api/bots/start",
    exhausted: false,
    duration,
    userPrompt: systemPrompt,
    private: false,
    userName: hostUsername || "",
  }
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

export async function getUserByAssistantId(
  rawInput: GetUserByAssistantIdInput
): Promise<User | null> {
  try {
    const validatedInput = getUserByAssistantIdSchema.safeParse(rawInput)
    if (!validatedInput.success) return null

    const [result] = await psGetUserByAssistantId.execute({
      assistantId: validatedInput.data.assistantId,
    })
    return result?.user || null
  } catch (error) {
    console.error(error)
    throw new Error("Error getting user by assistant ID")
  }
}
