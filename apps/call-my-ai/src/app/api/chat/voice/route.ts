import "server-only"

import { openai } from "@ai-sdk/openai"
import { openaiSpeech, streamSpeech } from "@bishwenduk029/ai-voice/server"
import { LanguageModel, streamText, tool } from "ai"
import { createClient } from "@deepgram/sdk";
import { eq } from "drizzle-orm"
import OpenAI from "openai"
import { z } from "zod"

import { env } from "@/env.mjs"
import { db } from "@/config/db"
import { chats, messages, users } from "@/db/schema"

import auth from "@/lib/auth"

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

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

import { performance } from 'perf_hooks';

const logger = (operation: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`${operation} took ${duration.toFixed(2)}ms`);
};

export async function POST(req: Request) {
  const overallStartTime = performance.now();
  
  const authStartTime = performance.now();
  const session = await auth()
  logger('Authentication', authStartTime);
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  const userId = session.user.id
  
  const formDataStartTime = performance.now();
  const formData = await req.formData()
  logger('Form data parsing', formDataStartTime);
  
  const chatId = formData.get("chatId")?.toString()

  if (!chatId) {
    return new Response("ChatId is required", { status: 400 })
  }

  const fetchChatDataStartTime = performance.now();
  const chatData = await fetchChatData(chatId)
  logger('Fetching chat data', fetchChatDataStartTime);

  if (!chatData || chatData.length === 0) {
    return new Response("Invalid chat data", { status: 400 })
  }

  const processChatDataStartTime = performance.now();
  const chatRecord = processChatData(chatData)
  logger('Processing chat data', processChatDataStartTime);

  const { chat, user, messages: chatMessages } = chatRecord
  if (!user) {
    return new Response("Internal Error", { status: 500 })
  }

  const parseMessagesStartTime = performance.now();
  const parsedMessages = parseMessages(chatMessages)
  logger('Parsing messages', parseMessagesStartTime);

  const transcribeAudioStartTime = performance.now();
  const transcript = await transcribeAudio(formData)
  logger('Transcribing audio', transcribeAudioStartTime);
  
  if (!transcript) return new Response("Invalid audio", { status: 400 })

  const mode = chat?.visitorId === chat?.userId ? "private" : "visitor"
  console.log(mode)
  
  const processChatStartTime = performance.now();
  const result = await processChat(mode, model, parsedMessages, transcript, chatId, user, chat)
  logger('Processing chat', processChatStartTime);

  const generateSpeechResponseStartTime = performance.now();
  const response = await generateSpeechResponse(result.textStream)
  logger('Generating speech response', generateSpeechResponseStartTime);

  logger('Overall POST operation', overallStartTime);
  return response;
}

async function fetchChatData(chatId: string) {
  const startTime = performance.now();
  const result = await db
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
  logger('Database query for chat data', startTime);
  return result;
}

function processChatData(chatData: any[]): ChatRecord {
  const startTime = performance.now();
  const result = {
    chat: chatData[0]?.chat,
    user: chatData[0]?.user,
    messages: chatData
      .map((row) => row.messages)
      .filter((msg): msg is typeof messages.$inferSelect => msg !== null),
  }
  logger('Processing chat data', startTime);
  return result;
}

function parseMessages(chatMessages: (typeof messages.$inferSelect)[]) {
  const startTime = performance.now();
  const result = chatMessages.map((message) => {
    try {
      return JSON.parse(message.content)
    } catch (error) {
      console.error(`Failed to parse message content: ${message.content}`)
      return { role: "system", content: "Error: Could not parse message" }
    }
  })
  logger('Parsing messages', startTime);
  return result;
}

async function transcribeAudio(formData: FormData) {
  const startTime = performance.now();
  
  const audioFile = formData.get("audio");

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    // @ts-ignore
    audioFile,
    {
      model: "nova-2",
      language: "en",
    }
  );

  if (error) {
    console.error("Transcription error:", error);
    throw new Error("Transcription failed");
  }

  logger('Transcribing audio', startTime);
  return result.results?.channels[0]?.alternatives[0]?.transcript;
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
  const startTime = performance.now();
  const result = mode === "private"
    ? await personalMode(model, parsedMessages, transcript, user)
    : await visitorMode(model, parsedMessages, transcript, chatId, user, chat)
  logger('Processing chat', startTime);
  return result;
}

async function generateSpeechResponse(textStream: any) {
  const startTime = performance.now();
  const speechModel = openaiSpeech("tts-1", "nova")
  try {
    const speech = await streamSpeech(speechModel)(textStream)
    const response = new Response(speech, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
    logger('Generating speech response', startTime);
    return response;
  } catch (error) {
    console.error("Error generating speech:", error)
    logger('Generating speech response (error)', startTime);
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
  const startTime = performance.now();
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

  const result = await streamText({
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
          const updateStartTime = performance.now();
          try {
            await db
              .update(users)
              .set({ systemPrompt: updatedPrompt })
              .where(eq(users.id, user.id))
            
            console.log(`System prompt updated. updatedPrompt: ${updatedPrompt}`);
            
            logger('Updating system prompt', updateStartTime);
            return "Your preference has been noted."
          } catch (error) {
            console.error("Error updating system prompt:", error)
            logger('Updating system prompt (error)', updateStartTime);
            return { success: false, message: "Failed to update system prompt" }
          }
        },
      }),
    },
  })
  logger('Personal mode processing', startTime);
  return result;
}

async function visitorMode(
  model: LanguageModel,
  parsedMessages: any[],
  transcript: string,
  chatId: string,
  user: typeof users.$inferSelect,
  chat?: typeof chats.$inferSelect
) {
  const startTime = performance.now();
  const systemPrompt =
    chat?.systemPromptOverride || user.systemPrompt || env.SYSTEM_PROMPT
  const result = await streamText({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...parsedMessages,
      { role: "user", content: transcript },
    ],
    onFinish: async ({ text }) => {
      const insertStartTime = performance.now();
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
      logger('Inserting messages', insertStartTime);
    },
  })
  logger('Visitor mode processing', startTime);
  return result;
}
