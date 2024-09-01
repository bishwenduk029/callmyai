// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAssistantById } from "@/actions/assistant"
import { auth } from "@/auth"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Settings from "@/components/assistant/settings"

export default async function SettingsPage({
  params,
}: {
  params: { assistantId: string }
}) {
  const session = await auth()

  if (!session) redirect("/signin")

  const result = await getAssistantById({ assistantId: params.assistantId })

  if (!result || !result.data)
    return (
      <div className="container mx-auto text-center">Assistant not found</div>
    )

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link href="/dashboard/settings" className="font-semibold text-primary">
          Settings
        </Link>
        <Link href={`/dashboard/assistants/${result.data.assistant.id}/calls`}>
          Calls
        </Link>
      </nav>
      <div className="flex w-full flex-col space-y-2">
        <Breadcrumb className="mx-3 mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/assistants">
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
        <Settings
          assistant={result.data.assistant!}
          config={result.data.config!}
        />
      </div>
    </>
  )
}
