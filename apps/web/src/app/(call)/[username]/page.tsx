import { RtviConfig } from "@/actions/assistant"
import { createNewChatSession, getUserByEmail } from "@/actions/user"

import auth from "@/lib/auth"

import { DailyChatRoomProvider } from "@/components/audio/chat-room-provider"

export default async function ChatRoomPage({
  params,
}: {
  params: { username: string }
}) {
  const session = await auth()
  const result = await getUserByEmail({ email: session?.user.email || "" })
  const newSession = await createNewChatSession(params.username, result?.data)
  const dailyconfig: RtviConfig = {
    llm: {
      model: {
        name: "gpt-4o-mini",
        provider: "openai",
      },
      messages: [
        {
          role: "systemt",
          content: newSession.userPrompt || "",
        },
      ],
    },
    tts: {
      provider: "elevenlabs",
      voice: "Bella",
    },
  }

  return (
    <div className="container">
      <DailyChatRoomProvider
        visitor={result?.data}
        session={newSession}
        configuration={dailyconfig}
      />
    </div>
  )
}
