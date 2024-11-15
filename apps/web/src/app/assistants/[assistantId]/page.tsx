import { initiateNewSessionforAssistant, RtviConfig } from "@/actions/assistant"
import { getUserByEmail } from "@/actions/user"
import { redis } from "@callmyai/kv"

import auth from "@/lib/auth"

import { DailyChatRoomProvider } from "@/components/audio/chat-room-provider"

export default async function ChatRoomPage({
  params,
}: {
  params: { assistantId: string }
}) {
  const session = await auth()
  const result = await getUserByEmail({ email: session?.user.email || "" })
  const assistantConfiguration: RtviConfig | null = await redis.get(
    `assistant:${params.assistantId}`
  )

  if (!assistantConfiguration) {
    throw new Error("Invalid assistant configuration")
  }

  const chatRoomSession = await initiateNewSessionforAssistant({
    assistantId: params.assistantId,
    config: assistantConfiguration
  })

  return (
    <>
      <div className="fixed top-0 z-[1000] w-full bg-black py-2.5 text-center text-foreground dark:text-background font-heading font-bold">
        {assistantConfiguration.header}
      </div>
      <div className="container">
        <DailyChatRoomProvider
          visitor={result?.data}
          configuration={assistantConfiguration}
          session={chatRoomSession?.data!}
        />
      </div>
    </>
  )
}
