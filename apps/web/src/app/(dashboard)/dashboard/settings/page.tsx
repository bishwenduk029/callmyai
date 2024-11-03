// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import {
  Folders,
  Gear,
  Headset,
  Phone,
  PhoneIncoming,
  PlugsConnected,
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
      <nav className="mx-3 mt-3 hidden max-h-5 gap-4 text-md text-muted-foreground sm:grid sm:w-1/6">
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
        <Link
          href="/dashboard/integrations"
          className="flex items-center hover:underline"
        >
          <PlugsConnected className="mr-2 h-5 w-5" />
          Connect Apps
        </Link>
        <Link
          href="/dashboard/data-sources"
          className="flex items-center hover:underline"
        >
          <Folders className="mr-2 h-5 w-5" />
          Data Sources
        </Link>
      </nav>
      <Settings user={user.data} />
    </>
  )
}
