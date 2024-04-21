import 'server-only'
import { OpenAIStream } from 'ai'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'
import { ElevenLabsStreamingSpeechResponse } from '@bishwenduk029/ai-voice/server'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_URL,
  apiKey: process.env.OPENAI_API_KEY
})

const DEEPGRAM_API_KEY = process.env.TTS_ELEVENLABS_API_KEY
const DEEPGRAM_VOICE_ID = process.env.TTS_ELEVENLABS_VOICEID

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
  const json = await req.json()
  const { messages } = json
  const userId = (await auth({ cookieStore }))?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const systemPrompt = `
  Your role is to act as a friendly human assistant by the user preferred name. Your given name is Nova.
  `

  // @ts-ignore
  const res = await openai.chat.completions.create({
    // @ts-ignore
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}`
      },
      ...messages.map((message: { role: any; content: any }) => ({
        role: message.role,
        content: message.content
      }))
    ],
    temperature: 0.4,
    stream: true
  })

  const textStream = OpenAIStream(res, {
    onCompletion: async completion => {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      // Insert chat into database.
      await supabase.from('chats').upsert({ id, payload }).throwOnError()
    }
  })

  try {
    return new ElevenLabsStreamingSpeechResponse(
      textStream,
      DEEPGRAM_API_KEY || '',
      DEEPGRAM_VOICE_ID
    )
  } catch (error) {
    console.log(error)
    return new Response(null, {
      status: 500
    })
  }
}
