# AI-Voice

The AI voice SDK is a library for easily integrating AI powered streaming voice and transcriptions into your AI applications. Build low latency voice chatbots.

## Features

1. React Hook `useVoiceChat` for easy transcription and streaming voice chat in client side.
2. Streaming Speech response for various AI voice providers like OpenAI, Elevenlabs, ELEVENLABSs and more coming soon.
   1. ElevenLabsStreamingSpeechResponse
   2. ELEVENLABSStreamingSpeechResponse
3. Works well with streaming text responses generated using ai package from [Vercel](https://vercel.com/).

## Installation

```sh
pnpm install @bishwenduk029/ai-voice
```

## Usage

### Client Side setup
```ts
...
import { useVoiceChat } from '@bishwenduk029/ai-voice/ui'
...

export default function Chat({ id, initialMessages, className }: ChatProps) {
  const { speaking, listening, thinking, initialized, messages, setMessages } =
    useVoiceChat({
      api: '/api/chat/voice',
      initialMessages,
      transcribeAPI: '/api/transcribe',
      body: {
        id
      },
      speakerPause: 500,
      onSpeechCompletion: async () => {
        if (id) {
          const chat = await getChat(id)
          setMessages(chat?.messages || [])
        }
      }
    })

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={initialized} />
          </>
        ) : (
          <EmptyScreen />
        )}
      </div>
      <ChatPanel
        id={id}
        initialized={initialized}
        speaking={speaking}
        listening={listening}
        thinking={thinking}
        messages={messages}
      />
    </>
  )
}
```

### Hook up Server APIs
`/api/chat/voice`
```ts
import 'server-only'
...
import { OpenAIStream } from 'ai'
import OpenAI from 'openai'
import { ElevenLabsStreamingSpeechResponse } from '@bishwenduk029/ai-voice/server'
...

export const runtime = 'edge'

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_URL,
  apiKey: process.env.OPENAI_API_KEY
})

const ELEVENLABS_API_KEY = process.env.TTS_ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.TTS_ELEVENLABS_VOICEID

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
```
`/api/transcribe`
```ts
import OpenAI from 'openai'

const speechBackend = new OpenAI({
  baseURL: process.env.OPENAI_SPEECH_TO_TEXT_URL,
})

export async function POST(req: Request) {
  const formData = await req.formData()

  try {
    // Create transcription from a video file
    const transcriptionResponse =
      await speechBackend.audio.transcriptions.create({
        // @ts-ignore
        file: formData.get('audio'),
        model: 'whisper-1',
        language: 'en'
      })

    const transcript = transcriptionResponse?.text

    // Return the transcript if no inappropriate content is detected
    return new Response(JSON.stringify({ transcript }), {
      status: 200
    })
  } catch (error) {
    console.error('server error', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500
    })
  }
}
```

## Limitations
Currently the speech streaming only works for english text streams. Multi-lingual support in future.