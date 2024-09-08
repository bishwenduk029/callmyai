// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import {
  Gear,
  Headset,
  Phone,
  PhoneIncoming,
  Robot,
} from "@phosphor-icons/react/dist/ssr"

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
        <Link
          href="/dashboard/settings"
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" weight="duotone" />
          Settings
        </Link>
        <Link
          href="/dashboard/calls"
          className="flex items-center hover:underline"
        >
          <PhoneIncoming className="mr-2 h-5 w-5" />
          Calls
        </Link>
        <Link
          href="/dashboard/assistants"
          className="flex items-center hover:underline"
        >
          <Headset className="mr-2 h-5 w-5" />
          Assistants
        </Link>
      </nav>
      <Settings user={user.data} />
    </>
  )
}
