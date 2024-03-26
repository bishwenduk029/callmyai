// import { env } from "env.mjs"
// import { getServerSession } from "next-auth"
import OpenAI from 'openai'

// import { authOptions } from "@/lib/auth"

const openaiTTSapi = new OpenAI({
  baseURL: process.env.OPENAI_TEXT_TO_SPEECH_URL,
  apiKey: process.env.OPENAI_API_KEY
})

export async function OpenAITTS(text: string, voice?: string) {
  const response = await fetch(
    `${process.env.OPENAI_TEXT_TO_SPEECH_URL}/audio/speech` || '',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'tts-1',
        voice: voice,
        stream: true,
        response_format: 'mp3',
        speed: 10
      })
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  //@ts-ignore
  const reader = response.body.getReader()
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          controller.close()
          break
        }

        controller.enqueue(value)
      }
    }
  })
  return stream
}

export async function getOpenAIVoices() {
  console.log("The correct voices was call")
  return JSON.stringify([
    {
      voiceId: 'EN-US',
      description: 'Female American English Voice'
    },
    {
      voiceId: 'EN-BR',
      description: 'Female British English Voice'
    },
    {
      voiceId: 'EN_INDIA',
      description: 'Female Indian English Voice'
    },
    {
      voiceId: 'EN-AU',
      description: 'Female Australian English Voice'
    },
    {
      voiceId: 'EN-Default',
      description: 'Female default accent English Voice'
    }
  ])
}
