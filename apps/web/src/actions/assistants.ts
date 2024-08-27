"use server"

import { z } from "zod"

import { psGetAssistantById, psGetUserById } from "@/db/prepared/statements"

import { ChatSession } from "@/components/audio/chat-room-provider"

const schema = z.object({
  id: z.string(),
})

export const fetchAssistantById = async (
  input: z.infer<typeof schema>
): Promise<{ chatSession: ChatSession; assistantId: string }> => {
  try {
    const assistantResult = await psGetAssistantById.execute({
      id: input.id,
    })

    if (assistantResult.length === 0) {
      throw new Error("Assistant not found")
    }

    const assistant = assistantResult[0]
    if (!assistant || !assistant.userId) {
      throw new Error("Assistant is not associated with a valid user")
    }

    const userResult = await psGetUserById.execute({
      id: assistant.userId,
    })

    if (userResult.length === 0) {
      throw new Error("Assistant's user ID is not valid")
    }

    const chatSession = {
      exhausted: false,
      duration: 50,
      private: false,
      prompt: assistant.prompt,
      assistantId: assistant.id,
      username: userResult[0].username,
    }
    return { ...chatSession, assistantId: assistant.id }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unexpected error")
  }
}
