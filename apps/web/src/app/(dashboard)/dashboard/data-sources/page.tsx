import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserByEmail, getUserSubscriptionByUserId } from "@/actions/user"
import { auth } from "@/auth"
import { Gear } from "@phosphor-icons/react"
import {
  AppWindow,
  Folders,
  GearFine,
  HardDrives,
  Headset,
  PhoneIncoming,
  Plugs,
  PlugsConnected,
} from "@phosphor-icons/react/dist/ssr"

import { DataSources } from "@/components/data-sources"

export default async function DataSourcesPage() {
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

  const subscription = await getUserSubscriptionByUserId({
    userId: user.data.id,
  })

  if (!subscription) redirect("/pricing?feature=externalFiles")

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-foreground sm:grid sm:w-1/6">
        <Link
          href="/dashboard/settings"
          className="flex items-center hover:underline"
        >
          <GearFine className="mr-2 h-5 w-5" />
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
        {/* <Link
          href="/dashboard/integrations"
          className="flex items-center hover:underline"
        >
          <Plugs className="mr-2 h-5 w-5" />
          Connect Apps
        </Link> */}
        <Link
          href="/dashboard/data-sources"
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <Folders className="mr-2 h-5 w-5" weight="bold" />
          Data Sources
        </Link>
      </nav>
      <DataSources userEmail={user.data.email} userId={user.data.id} allowedFiles={subscription.allowedFiles} allowedPagesToScrape={subscription.allowedApps} />
    </>
  )
}
