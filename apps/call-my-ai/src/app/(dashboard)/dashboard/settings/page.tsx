// page.tsx
import { redirect } from "next/navigation"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"

import { CallSummaries } from "@/components/calls"
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

  return (
    <div className="container w-full lg:w-1/2 mx-auto mt-5 flex flex-col items-start justify-center space-y-5 text-lg">
      <Settings user={{ id: user.id, username: user.username }} />
      <div className="flex flex-col w-full">
        <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl mb-4">
          Call history
        </h2>
        <CallSummaries userId={user.id} />
      </div>
    </div>
  )
}
