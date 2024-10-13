// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAssistantById } from "@/actions/assistant"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import {
  Browser,
  Gear,
  Headset,
  PhoneIncoming,
} from "@phosphor-icons/react/dist/ssr"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AssistantIframe } from "@/components/assistant/assistant-iframe"
import { CallMyAiMobilePreview } from "@/components/assistant/callmyai-mobile-preview"
import Settings from "@/components/assistant/settings"

export default async function SettingsPage({
  params,
}: {
  params: { assistantId: string }
}) {
  const session = await auth()

  if (!session) redirect("/signin")

  const user = await getUserByEmail({
    email: session.user.email || "",
  })

  const result = await getAssistantById({ assistantId: params.assistantId })

  if (!result || !result.data)
    return (
      <div className="container mx-auto text-center">Assistant not found</div>
    )

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link
          href={`/dashboard/assistants/${params.assistantId}/settings`}
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" weight="duotone" />
          Settings
        </Link>
        <Link
          href={`/dashboard/assistants/${params.assistantId}/calls`}
          className="flex items-center hover:underline"
        >
          <PhoneIncoming className="mr-2 h-5 w-5" />
          Calls
        </Link>
      </nav>
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
        <div className="flex flex-col py-4">
          <div className="mb-2 w-full md:w-3/4">
            <Settings
              assistant={result.data.assistant!}
              config={result.data.config!}
              userId={user.data?.id}
            />
          </div>
          <CallMyAiMobilePreview assistantId={params.assistantId} />
        </div>
      </div>
    </>
  )
}
