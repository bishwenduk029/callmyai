// page.tsx
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  getAssistantById,
  getChatSummariesByAssistantId,
} from "@/actions/assistant"
import { auth } from "@/auth"
import { Gear, Headset, PhoneIncoming } from "@phosphor-icons/react/dist/ssr"

import { PAGE_SIZE } from "@/lib/utils"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import CallSummaryLoadingState from "@/components/call-summary-loader"
import { CallSummaries } from "@/components/calls"

export default async function CallsPage({
  params: { assistantId },
}: {
  params: { assistantId: string }
}) {
  const session = await auth()

  if (!session) redirect("/signin")

  const result = await getAssistantById({ assistantId })

  if (!result || !result.data)
    return (
      <div className="container mx-auto text-center">Assistant not found</div>
    )

  if (!result) redirect("/dashboard/assistants")

  const initialSummaries = await getChatSummariesByAssistantId(
    assistantId,
    1,
    PAGE_SIZE
  )

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link
          href={`/dashboard/assistants/${assistantId}/settings`}
          className="flex items-center text-primary hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" />
          Settings
        </Link>
        <Link
          href={`/dashboard/assistants/${assistantId}/calls`}
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <PhoneIncoming className="mr-2 h-5 w-5" weight="duotone" />
          Calls
        </Link>
      </nav>
      <Suspense fallback={<CallSummaryLoadingState />}>
        <div className="flex w-full flex-col space-y-2">
          <Breadcrumb className="mx-3 mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard/assistants"
                  className="flex flex-row"
                >
                  <Headset className="mr-2 h-5 w-5" weight="duotone" />
                  Assistants
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/dashboard/assistants/${result.data.assistant.id}/settings`}
                  aria-current="page"
                >
                  {result.data.assistant.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <CallSummaries
            assistantId={result.data?.assistant.id}
            initialSummaries={initialSummaries}
          />
        </div>
      </Suspense>
    </>
  )
}
