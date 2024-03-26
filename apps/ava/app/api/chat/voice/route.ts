import 'server-only'
import OpenAI from 'openai'
import prisma from '@/lib/prisma'
import { OpenAIStream } from 'ai'
import { ElevenLabsStreamingSpeechResponse } from '@bishwenduk029/ai-voice/server'

export const runtime = 'nodejs'

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_URL,
  apiKey: process.env.OPENAI_API_KEY
})

const ELEVENLABS_API_KEY = process.env.TTS_ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.TTS_ELEVENLABS_VOICEID

export async function POST(req: Request) {
  const body = await req.json()
  const { message } = body
  const assistant_id = '2'
  /**
   * We represent intermediate steps as system messages for display purposes,
   * but don't want them in the chat history.
   */

  let assistant = await prisma.assistant.findUnique({
    where: {
      id: '2'
    },
    include: {
      user_preferences: true,
      messages: true
    }
  })

  const assistantMessages = assistant?.messages ?? []

  const messages = [
    ...assistantMessages.map(
      (message: {
        id: string
        created_at: Date
        content: string
        file_ids: string[]
        metadata: unknown
        role: any
        assistant_id: string | null
        thread_id: string | null
        object: any
      }) => ({
        id: message.id,
        role: message.role.toString(),
        content: message.content
      })
    ),
    { role: 'user', content: message }
  ].filter(
    // @ts-ignore
    (message: VercelChatMessage) =>
      message.role === 'user' || message.role === 'assistant'
  )

  const systemPrompt = assistant?.instructions
  console.log(messages)

  // @ts-ignore
  const res = await openai.chat.completions.create({
    // @ts-ignore
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}\n${assistant?.user_preferences[0].preference}`
      },
      ...messages.map(message => ({
        role: message.role,
        content: message.content
      }))
    ],
    temperature: 0.4,
    stream: true
  })

  const textStream = OpenAIStream(res, {
    onCompletion: async completedText => {
      console.log(completedText)
      await prisma.message.createMany({
        // @ts-ignore
        data: [
          {
            role: 'user',
            content: message,
            assistant_id: assistant_id
          },
          {
            // @ts-ignore
            content: completedText,
            role: 'assistant',
            assistant_id: assistant_id
          }
        ]
      })
    }
  })

  try {
    // @ts-ignore
    return new ElevenLabsStreamingSpeechResponse(
      textStream,
      ELEVENLABS_API_KEY || '',
      ELEVENLABS_VOICE_ID
    )
  } catch (error) {
    console.log(error)
    return new Response(null, {
      status: 500
    })
  }
}
