// page.tsx
import { redirect } from "next/navigation"
import { getChatsForUser, getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"

import { ChatList } from "@/components/chats"
import Settings from "@/components/settings"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/signin")
  }

  const user = await getUserByEmail({
    email: session.user.email || "",
  })

  if (!user) {
    redirect("/signin")
  }

  const chats = await getChatsForUser(user.id)

  return (
    <div className="container w-full lg:w-1/2 mx-auto mt-5 flex flex-col items-start justify-center space-y-5 text-lg">
      <Settings user={{ id: user.id, username: user.username }} />
      <div className="flex flex-col">
        <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl mb-4">
          Call history
        </h2>
        <ChatList chats={chats} />
      </div>
    </div>
  )
}
