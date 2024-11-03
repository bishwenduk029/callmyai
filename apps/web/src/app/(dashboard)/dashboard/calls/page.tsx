// page.tsx
import { getCallSummariesForUser, getUserByEmail, getUserSubscriptionsByUserId } from "@/actions/user"
import { auth } from "@/auth"
import {
  Folders,
  Gear,
  Headset,
  PhoneIncoming,
  PlugsConnected
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { PAGE_SIZE } from "@/lib/utils"

import CallSummaryLoadingState from "@/components/call-summary-loader"
import { CallSummaries } from "@/components/calls"

export default async function CallsPage() {
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

  const subscription = await getUserSubscriptionsByUserId({
    userId: user.data.id,
  })

  const initialSummaries = await getCallSummariesForUser(
    user.data?.id,
    1,
    PAGE_SIZE
  )

  return (
    <div className="h-full w-full">
      <nav className="mx-3 mt-3 hidden max-h-5 gap-4 text-md text-muted-foreground sm:grid sm:w-1/6">
        <Link
          href="/dashboard/settings"
          className="flex items-center text-primary hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/dashboard/calls"
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <PhoneIncoming className="mr-2 h-5 w-5" weight="duotone" />
          Calls
        </Link>
        <Link
          href={!subscription ? "/pricing?feature=createAssistant" : "/dashboard/assistants"}
          className="flex items-center hover:underline"
        >
          <Headset className="mr-2 h-5 w-5" />
          Assistants
          {!subscription && (
              <span className="ml-1 -mt-8 rounded bg-primary px-1.5 text-sm font-bolder text-primary-foreground">
                $
              </span>
            )}
        </Link>
        <Link
          href={!subscription ? "/pricing?feature=externalApps" : "/dashboard/integrations"}
          className="flex items-center hover:underline"
        >
          <PlugsConnected className="mr-2 h-5 w-5" />
          Connect Apps
          {!subscription && (
              <span className="ml-1 -mt-8 rounded bg-primary px-1.5 text-sm font-bolder text-primary-foreground">
                $
              </span>
            )}
        </Link>
        <Link
          href={!subscription ? "/pricing?feature=externalFiles" : "/dashboard/data-sources"}
          className="flex items-center hover:underline"
        >
          <Folders className="mr-2 h-5 w-5" />
          Data Sources
          {!subscription && (
              <span className="ml-1 -mt-8 rounded bg-primary px-1.5 text-sm font-bolder text-primary-foreground">
                $
              </span>
            )}
        </Link>
      </nav>
      <Suspense fallback={<CallSummaryLoadingState />}>
        <CallSummaries
          userId={user.data?.id}
          initialSummaries={initialSummaries}
        />
      </Suspense>
    </div>
  )
}
