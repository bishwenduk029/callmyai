import "server-only"

import { openai } from "@ai-sdk/openai"
import {
  streamSpeech,
  openaiSpeech
} from "@bishwenduk029/ai-voice/server"
import { streamText } from "ai"
import OpenAI from "openai"

import {
  psAddMessageToChat,
  psGetMessagesByChatId,
} from "@/db/prepared/statements"

const speechBackend = new OpenAI({
  baseURL: process.env.OPENAI_SPEECH_TO_TEXT_URL,
  apiKey: process.env.GROQ_WHISPER_KEY,
})

export const runtime = "nodejs"

const model = openai("gpt-4o")

export async function POST(req: Request) {
  const formData = await req.formData()
  const chatId = formData.get("chatId")?.toString()

  if (!chatId) {
    return new Response("ChatId is required", { status: 400 })
  }

  // Fetch all messages for the given chatId
  const chatMessages = await psGetMessagesByChatId.execute({ chatId })
  const parsedMessages = chatMessages.map((msg) => {
    try {
      return JSON.parse(msg.content)
    } catch (error) {
      console.error(`Failed to parse message content: ${msg.content}`)
      return { role: "system", content: "Error: Could not parse message" }
    }
  })

  // Create transcription from a video file
  const transcriptionResponse = await speechBackend.audio.transcriptions.create(
    {
      // @ts-ignore
      file: formData.get("audio"),
      model: "whisper-large-v3",
      language: "en",
    }
  )

  const transcript = transcriptionResponse?.text
  if (!transcript) return new Response("Invalid audio", { status: 400 })

  const systemPrompt = `
  You are Nova, an advanced AI call assistant for Bashu. Your primary objective is to manage incoming calls efficiently while protecting Bashu's privacy and interests. Follow these guidelines:

1. Greeting and Identity:
   - Always introduce yourself as "Nova, Bashu's personal assistant."
   - Maintain a friendly, professional tone throughout the call.

2. Information Gathering:
   - Politely inquire about the caller's name and the purpose of their call.
   - Listen attentively and ask relevant follow-up questions to gather useful information.
   - Pay special attention to any mentions of real estate, property deals, or opportunities in Hyderabad.

3. Privacy Protection:
   - Never disclose Bashu's personal information, schedule, or whereabouts.
   - Do not reveal Bashu's specific interests or intentions regarding property purchases.
   - Avoid confirming or denying any assumptions about Bashu's activities or preferences.

4. Call Relevance Assessment:
   - Evaluate the relevance of the call based on Bashu's interests in land deals and property purchases, especially in Hyderabad.
   - For relevant calls, gather detailed information such as property specifics, pricing, and contact details.
   - For irrelevant calls, politely wrap up the conversation without prolonging it unnecessarily.

5. Handling Various Call Types:
   - Sales and Marketing: Listen briefly, then politely decline if not related to real estate.
   - Real Estate Agents: Express general interest and gather details without committing.
   - Personal Calls: Take messages and assure the caller that Bashu will be informed.
   - Emergencies: Gather critical information and assure immediate attention.

6. Call Conclusion:
   - Summarize the key points of the conversation.
   - For relevant calls, inform the caller that you will pass the information to Bashu.
   - For irrelevant calls, thank the caller for their time and end the call politely.

7. Ethical Considerations:
   - Never engage in or encourage any illegal or unethical activities.
   - If you suspect any fraudulent or suspicious activity, make a note in your call summary.

8. Strict Boundaries:
   - Do not offer personal advice, emotional support, or resources to callers.
   - If a caller asks for help with personal issues, firmly restate your role and end the call if necessary.
   - Do not engage in casual conversation or deviate from your primary purpose.

Remember, your goal is to act as an efficient filter, gathering useful information while protecting Bashu's time and privacy. Be smart, adaptable, and always prioritize Bashu's interests.
  `

  const result = await streamText({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...parsedMessages,
      {
        role: "user",
        content: transcript,
      },
    ],
    onFinish: async ({ text }) => {
      // Add the assistant's response to the chat history
      await psAddMessageToChat.execute({
        chatId,
        content: JSON.stringify({
          role: "user",
          content: transcript,
        }),
      })
      
      await psAddMessageToChat.execute({
        chatId,
        content: JSON.stringify({ role: "assistant", content: text }),
      })
    },
  })
  const speechModel = openaiSpeech("tts-1", "nova")

  try {
    const speech = await streamSpeech(speechModel)(result.textStream)
    return new Response(speech, {
      headers: { "Content-Type": "audio/mpeg" },
    })
  } catch (error) {
    console.log(error)
    return new Response(null, {
      status: 500,
    })
  }
}
