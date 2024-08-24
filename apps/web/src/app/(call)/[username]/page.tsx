import { redirect } from "next/navigation"
import { getUserByEmail } from "@/actions/user"

import { DEFAULT_UNAUTHENTICATED_REDIRECT } from "@/config/defaults"

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

  if (!session) redirect(DEFAULT_UNAUTHENTICATED_REDIRECT)

  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container">
          <ChatRoomProvider visitor={visitor} hostUsername={params.username} />
        </div>
      </div>
    </SessionProvider>
  )
}
