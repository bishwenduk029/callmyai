// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"

import Settings from "@/components/dashboard/settings"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/signin")
  }

  const user = await getUserByEmail({
    email: session.user.email || "",
  })

  if (!user || !user.data) {
    redirect("/signin")
  }

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link href="/dashboard/settings" className="font-semibold text-primary">
          Settings
        </Link>
        <Link href="/dashboard/calls">Calls</Link>
        <Link href="/dashboard/assistants">Assistants</Link>
      </nav>
      <Settings user={user.data} />
    </>
  )
}
