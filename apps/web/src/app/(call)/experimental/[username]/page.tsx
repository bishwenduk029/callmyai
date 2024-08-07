// /[username]/page.tsx
import { redirect } from "next/navigation"
import { createChat, getUserByEmail } from "@/actions/user"

import { DEFAULT_UNAUTHENTICATED_REDIRECT } from "@/config/defaults"

import auth from "@/lib/auth"

import { AudioReactiveInterface } from "@/components/audio/interface"

export default async function CallPage({
  params,
}: {
  params: { username: string }
}) {
  const session = await auth()
  if (!session) redirect(DEFAULT_UNAUTHENTICATED_REDIRECT)

  const visitor = await getUserByEmail({ email: session.user.email || "" })
  const newChat = await createChat(params.username, visitor)

  if (newChat.exhausted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-xl font-semibold">
          User has no more calls left.
        </div>
      </div>
    )
  }

  if (!newChat) {
    throw new Error("Currently Experiencing internal server issues")
  }

  if (!newChat.id) {
    // Handle the case where chat creation failed
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-xl font-semibold">
          Failed to initialize chat. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <AudioReactiveInterface chatId={newChat.id} personalMode={visitor?.username === params.username} />
    </div>
  )
}
