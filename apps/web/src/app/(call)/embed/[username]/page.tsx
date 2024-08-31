import { getUserByEmail } from "@/actions/user"

import auth from "@/lib/auth"

import { ChatRoomProvider } from "@/components/audio/chat-room-provider"

export default async function ChatRoomPage({
  params,
}: {
  params: { username: string }
}) {
  const session = await auth()
  const result = await getUserByEmail({ email: session?.user.email || "" })

  return (
    <div className="container">
      <ChatRoomProvider visitor={result?.data} hostUsername={params.username} />
    </div>
  )
}
