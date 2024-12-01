"use server"

import { redis } from "@callmyai/kv"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

import { db } from "@/config/db"
import {
  psCreateAssistant,
  psDeleteAssistant,
  psGetAssistantById,
  psGetAssistantsByUserId,
  psGetChatsByAssistantId,
  psGetUserByAssistantId,
  psUpdateAssistant,
} from "@/db/prepared/statements"
import { Assistant, assistants } from "@/db/schema"
import { env } from "@/env.mjs"
import type { ActionResponse } from "@/types/actions"

import auth from "@/lib/auth"
import { actionClient } from "@/lib/safe-action"

import type { ChatRoomSession } from "@/components/audio/callmyai-room"
import { CallSummary } from "@/components/calls"

import { getUserByEmail } from "./user"

const initiateNewSessionSchema = z.object({
  assistantId: z.string().uuid(),
  config: z.lazy(() => rtviConfigSchema),
})

export const initiateNewSessionforAssistant = actionClient
  .schema(initiateNewSessionSchema)
  .action(
    async ({
      parsedInput: { assistantId, config },
    }): Promise<ChatRoomSession | null> => {
      try {
        const [result] = await psGetUserByAssistantId.execute({ assistantId })
        if (!result) return null

        const chatRoomSession: ChatRoomSession = {
          exhausted: false,
          duration: parseInt(env.CALLMYAI_AGENT_CALL_DURATION),
          private: false,
          assistantId,
          userId: result.user.id,
          baseUrl: "/api/assistants/start",
          botName: result.assistant.name,
          header: config?.header || "",
          description: config?.description || "",
          avatar: config?.avatar || "",
          actionsOwnerEmail: result.user.email,
        }

        return chatRoomSession
      } catch (error) {
        console.error("Error initiating new session for assistant:", error)
        return null
      }
    }
  )

export const initiateTrialSessionforAssistant = actionClient
  .schema(initiateNewSessionSchema)
  .action(
    async ({
      parsedInput: { assistantId, config },
    }): Promise<ChatRoomSession | null> => {
      try {
        const chatRoomSession: ChatRoomSession = {
          exhausted: false,
          duration: parseInt(env.CALLMYAI_AGENT_CALL_DURATION),
          private: false,
          assistantId,
          baseUrl: "/api/assistants/start",
          header: config?.header || "",
          description: config?.description || "",
          avatar: config?.avatar || "",
        }

        return chatRoomSession
      } catch (error) {
        console.error("Error initiating new session for assistant:", error)
        return null
      }
    }
  )

const rtviConfigSchema = z
  .object({
    header: z.string().optional(),
    description: z.string().optional(),
    gender: z.string().optional(),
    ethnicity: z.string().optional(),
    avatar: z.string().optional(),
    tools: z.array(z.string().optional()).optional(),
    actionsOwnerEmail: z.string().optional(),
    dataSources: z
      .array(
        z.object({
          fileId: z.number(),
          sourceType: z.string(),
          fileName: z.string(),
        })
      )
      .optional(), // Add this line for RAG fileIds
    llm: z.object({
      model: z.object({
        provider: z.string(),
        name: z.string(),
      }),
      messages: z.array(
        z.object({
          role: z.string(),
          content: z.string(),
        })
      ),
    }),
    tts: z.object({
      provider: z.string(),
      voice: z.string(),
      metadata: z.union([z.object({ voice: z.string() }), z.any()]),
    }),
  })
  .optional()

export type RtviConfig = z.infer<typeof rtviConfigSchema>

const updateAssistantConfigSchema = z.object({
  assistantId: z.string().uuid(),
  config: rtviConfigSchema,
})

type AssistantConfig = z.infer<typeof rtviConfigSchema>

export const updateAssistantConfig = actionClient
  .schema(updateAssistantConfigSchema)
  .action(
    async ({
      parsedInput: { assistantId, config },
    }): Promise<ActionResponse> => {
      try {
        await redis.set(`assistant:${assistantId}`, JSON.stringify(config))
        return { success: true, data: config }
      } catch (error) {
        console.error("Error updating assistant config:", error)
        return { success: false, error: "Unexpected error occurred" }
      }
    }
  )

const createAssistantSchema = z.object({
  name: z.string(),
  duration: z.number(),
  userId: z.string().uuid().optional(),
  config: rtviConfigSchema.optional(),
})

export const createAssistant = actionClient
  .schema(createAssistantSchema)
  .action(
    async ({
      parsedInput: { name, duration, userId, config },
    }): Promise<ActionResponse> => {
      try {
        const session = await auth()
        const user = await getUserByEmail({ email: session?.user?.email || "" })

        if (!user || !user.data)
          return { success: false, error: "User does not exist" }

        // Get active subscription
        const activeSubscription = await db.query.subscriptions.findFirst({
          where: (subscription) =>
            eq(subscription.userId, user.data!.id) &&
            eq(subscription.status, "ACTIVE"),
        })

        if (!activeSubscription) {
          return { success: false, error: "No active subscription found" }
        }

        // Check number of existing assistants against subscription limit
        const existingAssistants = await db.query.assistants.findMany({
          where: (assistant) => eq(assistant.userId, user.data!.id),
        })

        if (
          existingAssistants.length >=
          (activeSubscription.allowedAssistants ?? 0)
        ) {
          return {
            success: false,
            error: `Maximum number of assistants (${activeSubscription.allowedAssistants}) reached`,
          }
        }

        // Validate duration against subscription limit
        const maxDuration = activeSubscription.allowedDuration ?? 0
        const finalDuration = Math.min(duration, maxDuration)

        const assistantId = uuidv4()

        // Create assistant with subscription-based limits
        const [createdAssistant] = await psCreateAssistant.execute({
          id: assistantId,
          name,
          duration: finalDuration,
          userId: user.data.id,
          callLimit: activeSubscription.allowedCalls ?? 50, // Set call limit from subscription
        })

        if (!createdAssistant) {
          return { success: false, error: "Failed to create assistant" }
        }

        // Store RTVI config in Redis
        await redis.set(`assistant:${assistantId}`, JSON.stringify(config))
        revalidatePath("/dashboard/assistants")

        return {
          success: true,
          data: {
            ...createdAssistant,
            config,
          },
        }
      } catch (error) {
        console.error("Error creating assistant:", error)
        return { success: false, error: "Unexpected error occurred" }
      }
    }
  )

const updateAssistantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  duration: z.number(),
  config: rtviConfigSchema,
})

export const updateAssistant = actionClient
  .schema(updateAssistantSchema)
  .action(
    async ({
      parsedInput: { id, name, duration, config },
    }): Promise<ActionResponse> => {
      try {
        const [updatedAssistant] = await psUpdateAssistant.execute({
          id,
          name,
          duration,
        })

        if (!updatedAssistant) {
          return { success: false, error: "Failed to update assistant" }
        }

        // Update RTVI config in Redis
        if (config) {
          await redis.set(`assistant:${id}`, JSON.stringify(config))
        }

        return {
          success: true,
          data: {
            ...updatedAssistant,
            config,
          },
        }
      } catch (error) {
        console.error("Error updating assistant:", error)
        return { success: false, error: "Unexpected error occurred" }
      }
    }
  )

const deleteAssistantSchema = z.object({
  id: z.string().uuid(),
})

export const deleteAssistant = actionClient
  .schema(deleteAssistantSchema)
  .action(async ({ parsedInput: { id } }): Promise<ActionResponse> => {
    try {
      const [deletedAssistant] = await psDeleteAssistant.execute({ id })

      if (!deletedAssistant) {
        return { success: false, error: "Failed to delete assistant" }
      }

      // Remove RTVI config from Redis
      await redis.del(`assistant:${id}`)

      return {
        success: true,
        data: deletedAssistant,
      }
    } catch (error) {
      console.error("Error deleting assistant:", error)
      return { success: false, error: "Unexpected error occurred" }
    }
  })

const getAssistantsByUserIdSchema = z.object({
  userId: z.string(),
})

export const getAssistantsByUserId = actionClient
  .schema(getAssistantsByUserIdSchema)
  .action(async ({ parsedInput: { userId } }): Promise<Assistant[]> => {
    try {
      const result = await psGetAssistantsByUserId.execute({
        userId,
      })
      return result
    } catch (error) {
      console.error("Error getting assistants by user id:", error)
      return []
    }
  })

const getAssistantByIdSchema = z.object({
  assistantId: z.string().uuid(),
})

export const getAssistantById = actionClient
  .schema(getAssistantByIdSchema)
  .action(
    async ({
      parsedInput: { assistantId },
    }): Promise<{ assistant: Assistant; config: RtviConfig } | null> => {
      try {
        const [result] = await psGetAssistantById.execute({
          assistantId,
        })
        if (!result) return null

        const config: RtviConfig | null = await redis.get(
          `assistant:${assistantId}`
        )

        if (!config) return null

        return {
          assistant: result,
          config,
        }
      } catch (error) {
        console.error("Error getting assistant by id:", error)
        return null
      }
    }
  )

const getChatSummariesByAssistantIdSchema = z.object({
  assistantId: z.string().uuid(),
  page: z.number().min(1),
  pageSize: z.number().min(1),
})

export async function getChatSummariesByAssistantId(
  assistantId: string,
  page: number,
  pageSize: number
): Promise<{ summaries: CallSummary[]; hasMore: boolean }> {
  try {
    const offset = (page - 1) * pageSize
    const chatMessages = await psGetChatsByAssistantId.execute({
      assistantId,
      limit: pageSize,
      offset,
    })

    return {
      summaries: chatMessages,
      hasMore: chatMessages.length === pageSize,
    }
  } catch (error) {
    console.error("Error getting chat summaries by assistant id:", error)
    throw new Error("Failed to fetch chat summaries")
  }
}

export interface TrialAssistant {
  id: string
  name: string
  config: any
}

const getAssistantByPhoneSchema = z.object({
  phone: z.string(),
})

export const getAssistantByPhone = actionClient
  .schema(getAssistantByPhoneSchema)
  .action(async ({ parsedInput: { phone } }) => {
    try {
      const result = await db.query.assistants.findFirst({
        where: (assistant) => eq(assistant.phoneNumber, phone),
      })
      if (!result) return null

      // Get the assistant configuration from Redis
      const config: RtviConfig | null = await redis.get(
        `assistant:${result.id}`
      )
      if (!config || Object.keys(config).length === 0) return null

      return {
        assistant: result,
        config: {
          ...config,
          llm: {
            ...config.llm,
            messages: [
              {
                role: "system",
                content:
                  config?.description +
                  "\n " +
                  (config?.llm?.messages?.[0]?.["content"]?.replace(
                    /\${name}/g,
                    result.name!
                  ) || "Hello! How can I help you today?"),
              },
            ],
          },
          assistantId: result.id,
          userName: result.name,
          actionsOwnerEmail: result.id,
        },
      }
    } catch (error) {
      console.error("Error getting assistant by phone:", error)
      return null
    }
  })

const checkAndDecrementCallLimitSchema = z.object({
  assistantId: z.string().uuid(),
})

export const checkAndDecrementCallLimit = actionClient
  .schema(checkAndDecrementCallLimitSchema)
  .action(async ({ parsedInput: { assistantId } }): Promise<ActionResponse> => {
    try {
      const assistant = await db.query.assistants.findFirst({
        where: eq(assistants.id, assistantId),
      })

      if (!assistant || assistant.callLimit <= 0) {
        return {
          success: false,
          error: "Call limit exceeded for this assistant",
        }
      }

      await db
        .update(assistants)
        .set({
          callLimit: assistant.callLimit - 1,
          updatedAt: new Date(),
        })
        .where(eq(assistants.id, assistantId))

      return { success: true }
    } catch (error) {
      console.error("Error checking call limit:", error)
      return {
        success: false,
        error: "Failed to check call limit",
      }
    }
  })
