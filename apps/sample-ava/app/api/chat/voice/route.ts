import 'server-only'
import { ollama, createOllama } from 'ollama-ai-provider'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { streamText } from 'ai'
import { openaiSpeech, playhtSpeech, streamSpeech, createOpenAI } from '@bishwenduk029/ai-voice/server'

export const runtime = 'edge'

const model = ollama('llama3:latest')

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
  const json = await req.json()
  const { messages } = json
  // const userId = (await auth({ cookieStore }))?.user.id

  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  const systemPrompt = `
  Your role is to act as a friendly human assistant by the user preferred name. Your given name is Nova.
  `

  const result = await streamText({
    model,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}`
      },
      ...messages.map((message: { role: any; content: any }) => ({
        role: message.role,
        content: message.content
      }))
    ]
  })

  // OpenAI - env:OPENAI_API_KEY
  const speechModel =createOpenAI({
    baseURL: "http://localhost:8002",
    voiceId: "EN-Default"
  })

  // ElevenLabsIO - env:ELEVENLABS_API_KEY
  // const speechModel = elevenlabsSpeech(
  //   'eleven_turbo_v2',   //elevenlabs_speech_model
  //   'DIBkDE5u33APYlfhjihh' //elevenlabs_voice_id
  // )

    // PlayHt - env:PLAYHT_API_KEY
  // const speechModel = playhtSpeech(
  //   'PlayHT2.0-turbo', //playht_speech_model
  //   '<your-playht-user-id>',  
  //   "s3://voice-cloning-zero-shot/1afba232-fae0-4b69-9675-7f1aac69349f/delilahsaad/manifest.json"   //playht_voice_id
  // )

  // Deepgram - env:DEEPGRAM_API_KEY
  // const speechModel = deepgramSpeech("aura-asteria-en")

  try {
    const speech = await streamSpeech(speechModel.speech("tts-1"))(result.textStream)
    return new Response(speech, {
      headers: { 'Content-Type': 'audio/mpeg' }
    })
  } catch (error) {
    console.log(error)
    return new Response(null, {
      status: 500
    })
  }
}
