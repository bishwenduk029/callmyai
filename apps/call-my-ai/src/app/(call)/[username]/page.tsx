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

  let chatId: string | null = null
  try {
    const visitor = await getUserByEmail({ email: session.user.email || "" })
    const newChat = await createChat(params.username, visitor?.id || "")

    if (!newChat) {
      throw new Error("Currently Experiencing internal server issues")
    }
    chatId = newChat.id
  } catch (error) {
    console.error("Failed to create chat:", error)
    console.log(error)
  }

  if (!chatId) {
    // Handle the case where chat creation failed
    return <div>Failed to initialize chat. Please try again.</div>
  }

  return (
    <div className="container">
      <AudioReactiveInterface chatId={chatId} />
    </div>
  )
}
