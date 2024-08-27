// page.tsx
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

import Settings from "@/components/dashboard/settings"

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
    <>
      <nav className="hidden text-md mx-3 mt-3 sm:grid max-h-5 gap-4 text-muted-foreground">
        <Link href="/dashboard/settings" className="font-semibold text-primary">
          Settings
        </Link>
        <Link href="/dashboard/calls">Calls</Link>
      </nav>
      <Settings user={user} />
    </>
  )
}
