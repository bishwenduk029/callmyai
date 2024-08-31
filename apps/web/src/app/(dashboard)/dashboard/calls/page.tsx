// page.tsx
import { getCallSummariesForUser, getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
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
  const initialSummaries = await getCallSummariesForUser(
    user.data?.id,
    1,
    PAGE_SIZE
  )

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link href="/dashboard/settings">Settings</Link>
        <Link href="/dashboard/calls" className="font-semibold text-primary">
          Calls
        </Link>
      </nav>
      <Suspense fallback={<CallSummaryLoadingState />}>
        <CallSummaries userId={user.data?.id} initialSummaries={initialSummaries} />
      </Suspense>
    </>
  )
}
