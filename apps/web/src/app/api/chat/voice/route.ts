import "server-only"

import { openai } from "@ai-sdk/openai"
import { openaiSpeech, streamSpeech } from "@bishwenduk029/ai-voice/server"
import { LanguageModel, streamText, tool } from "ai"
import { eq } from "drizzle-orm"
import OpenAI from "openai"
import { z } from "zod"

import { env } from "@/env.mjs"
import { db } from "@/config/db"
import { chats, messages, users } from "@/db/schema"

import auth from "@/lib/auth"

const speechBackend = new OpenAI({
  baseURL: process.env.OPENAI_SPEECH_TO_TEXT_URL,
  apiKey: process.env.GROQ_WHISPER_KEY,
})

export const runtime = "nodejs"

const model = openai(env.OPENAI_MODEL)

type ChatRecord = {
  chat?: typeof chats.$inferSelect
  user?: typeof users.$inferSelect | null
  messages: (typeof messages.$inferSelect)[]
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  const userId = session.user.id
  const formData = await req.formData()
  const chatId = formData.get("chatId")?.toString()

  if (!chatId) {
    return new Response("ChatId is required", { status: 400 })
  }

  const chatData = await fetchChatData(chatId)

  if (!chatData || chatData.length === 0) {
    return new Response("Invalid chat data", { status: 400 })
  }

  const chatRecord = processChatData(chatData)

  const { chat, user, messages: chatMessages } = chatRecord
  if (!user) {
    return new Response("Internal Error", { status: 500 })
  }

  const parsedMessages = parseMessages(chatMessages)

  const transcript = await transcribeAudio(formData)
  if (!transcript) return new Response("Invalid audio", { status: 400 })

  const mode = chat?.visitorId === chat?.userId ? "private" : "visitor"
  console.log(mode)
  const result = await processChat(mode, model, parsedMessages, transcript, chatId, user, chat)

  return await generateSpeechResponse(result.textStream)
}

async function fetchChatData(chatId: string) {
  return await db
    .select({
      chat: chats,
      user: users,
      messages: messages,
    })
    .from(chats)
    .leftJoin(users, eq(chats.userId, users.id))
    .leftJoin(messages, eq(messages.chatId, chats.id))
    .where(eq(chats.id, chatId))
    .execute()
}

function processChatData(chatData: any[]): ChatRecord {
  return {
    chat: chatData[0]?.chat,
    user: chatData[0]?.user,
    messages: chatData
      .map((row) => row.messages)
      .filter((msg): msg is typeof messages.$inferSelect => msg !== null),
  }
}

function parseMessages(chatMessages: (typeof messages.$inferSelect)[]) {
  return chatMessages.map((message) => {
    try {
      return JSON.parse(message.content)
    } catch (error) {
      console.error(`Failed to parse message content: ${message.content}`)
      return { role: "system", content: "Error: Could not parse message" }
    }
  })
}

async function transcribeAudio(formData: FormData) {
  const transcriptionResponse = await speechBackend.audio.transcriptions.create(
    {
      // @ts-ignore
      file: formData.get("audio"),
      model: "whisper-large-v3",
      language: "en",
    }
  )
  return transcriptionResponse?.text
}

async function processChat(
  mode: string,
  model: LanguageModel,
  parsedMessages: any[],
  transcript: string,
  chatId: string,
  user: typeof users.$inferSelect,
  chat?: typeof chats.$inferSelect
) {
  return mode === "private"
    ? await personalMode(model, parsedMessages, transcript, user)
    : await visitorMode(model, parsedMessages, transcript, chatId, user, chat)
}

async function generateSpeechResponse(textStream: any) {
  const speechModel = openaiSpeech("tts-1", "nova")
  try {
    const speech = await streamSpeech(speechModel)(textStream)
    return new Response(speech, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error generating speech:", error)
    return new Response(null, {
      status: 500,
    })
  }
}

async function personalMode(
  model: LanguageModel,
  parsedMessages: any[],
  transcript: string,
  user: typeof users.$inferSelect
) {
  const currentSystemPrompt = user.systemPrompt || env.SYSTEM_PROMPT;
  const systemPrompt = `You are an AI assistant tasked with analyzing conversations and updating the system prompt for ${user.name || user.email}'s personal call assistant. Your goal is to understand the user's interests, preferences, and how they wish to be addressed. This information will be crucial for the call assistant when taking calls on the user's behalf.

Your responsibilities:
1. Carefully analyze the conversation to extract key information about the user's preferences, interests, and communication style.
2. Identify how the user wants to be referred to when someone calls.
3. Determine which types of propositions or topics align with the user's interests.
4. Craft an updated system prompt that incorporates this new information while preserving the essential elements of the original prompt.

The current system prompt is:

${currentSystemPrompt}

Based on the conversation, create a new, cohesive system prompt that:
- Seamlessly integrates the user's newly expressed preferences and interests
- Maintains the core functionality and purpose of the original prompt
- Provides clear guidance for the call assistant on how to handle incoming calls
- Reflects the user's communication style and preferred manner of interaction

Your output should be a complete, refined version of the entire system prompt, not just additions or modifications. Ensure that the updated prompt is comprehensive, coherent, and tailored to ${user.name || user.email}'s specific needs and preferences.`;

  return await streamText({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...parsedMessages,
      { role: "user", content: transcript },
    ],
    toolChoice: "required",
    tools: {
      updateSystemPrompt: tool({
        description: `Update the system prompt to incorporate user's preferences`,
        parameters: z.object({ 
          updatedPrompt: z.string(),
        }),
        execute: async ({ updatedPrompt }) => {
          try {
            await db
              .update(users)
              .set({ systemPrompt: updatedPrompt })
              .where(eq(users.id, user.id))
            
            console.log(`System prompt updated. updatedPrompt: ${updatedPrompt}`);
            
            return "Your preference has been noted."
          } catch (error) {
            console.error("Error updating system prompt:", error)
            return { success: false, message: "Failed to update system prompt" }
          }
        },
      }),
    },
  })
}

async function visitorMode(
  model: LanguageModel,
  parsedMessages: any[],
  transcript: string,
  chatId: string,
  user: typeof users.$inferSelect,
  chat?: typeof chats.$inferSelect
) {
  const systemPrompt =
    chat?.systemPromptOverride || user.systemPrompt || env.SYSTEM_PROMPT
  return await streamText({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...parsedMessages,
      { role: "user", content: transcript },
    ],
    onFinish: async ({ text }) => {
      await db.insert(messages).values([
        {
          chatId,
          content: JSON.stringify({ role: "user", content: transcript }),
        },
        {
          chatId,
          content: JSON.stringify({ role: "assistant", content: text }),
        },
      ])
    },
  })
}
