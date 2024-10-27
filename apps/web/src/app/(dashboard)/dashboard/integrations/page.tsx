import Link from "next/link"
import { redirect } from "next/navigation"
import { getIntegrationsByUserId } from "@/actions/integration"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import {
  AppWindow,
  Folders,
  Gear,
  Headset,
  PhoneIncoming,
  Plugs,
  PlugsConnected,
} from "@phosphor-icons/react/dist/ssr"

import { Integration } from "@/db/schema"

import IntegrationsClient from "@/components/integrations/client"

export default async function IntegrationsPage() {
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

  const integrationsResult = await getIntegrationsByUserId({
    userId: user.data.id,
  })

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid sm:w-1/6">
        <Link
          href="/dashboard/settings"
          className="flex items-center text-primary hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/dashboard/calls"
          className="flex items-center text-primary hover:underline"
        >
          <PhoneIncoming className="mr-2 h-5 w-5" />
          Calls
        </Link>
        <Link
          href="/dashboard/assistants"
          className="flex items-center text-primary hover:underline"
        >
          <Headset className="mr-2 h-5 w-5" />
          Assistants
        </Link>
        <Link
          href="/dashboard/integrations"
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <Plugs className="mr-2 h-5 w-5" weight="bold" />
          Integrations
        </Link>
        <Link
          href="/dashboard/data-sources"
          className="flex items-center text-primary hover:underline"
        >
          <Folders className="mr-2 h-5 w-5" />
          Data Sources
        </Link>
      </nav>
      <IntegrationsClient
        userEmail={user.data.email}
        userId={user.data.id}
        integrations={integrationsResult?.data?.data as Integration[]}
      />
    </>
  )
}
