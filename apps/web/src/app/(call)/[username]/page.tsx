
import { createNewChatSession, getUserByEmail } from "@/actions/user"
import auth from "@/lib/auth"

import { ChatRoomProvider } from "@/components/audio/chat-room-provider"
import { SessionProvider } from "next-auth/react"
import { Header } from "@/components/nav/header"

export default async function ChatRoomPage({
  params,
}: {
  params: { username: string }
}) {
  const session = await auth()
  const visitor = await getUserByEmail({ email: session?.user.email || "" })
  const newChatSession = await createNewChatSession(params.username, visitor)

  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container">
          <ChatRoomProvider chatSession={newChatSession} />
        </div>
      </div>
    </SessionProvider>
  )
}
