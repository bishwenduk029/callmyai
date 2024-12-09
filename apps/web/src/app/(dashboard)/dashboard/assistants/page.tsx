// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAssistantsByUserId } from "@/actions/assistant"
import { getUserByEmail, getUserSubscriptionByUserId } from "@/actions/user"
import { auth } from "@/auth"
import {
  Folders,
  Gear,
  Headset,
  PhoneIncoming,
  PlugsConnected,
  PlusCircle,
} from "@phosphor-icons/react/dist/ssr"

import { env } from "@/env.mjs"
import { Assistant } from "@/db/schema"

import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AnimatedIconButton } from "@/components/animated/plus-icon"
import { CreateAssistantNameForm } from "@/components/assistant/create-assistant-name-form"
import { CopyButton } from "@/components/copy-button"

export default async function AssistantsPage() {
  const session = await auth()

  if (!session) redirect("/signin")

  const user = await getUserByEmail({ email: session.user.email || "" })

  if (!user || !user.data) redirect("/signin")

  const subscription = await getUserSubscriptionByUserId({
    userId: user.data.id,
  })

  if (!subscription) redirect("/pricing?feature=createAssistant")

  const assistantsResponse = await getAssistantsByUserId({
    userId: user.data.id,
  })

  if (!assistantsResponse) {
    redirect("/error")
  }

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-foreground sm:grid sm:w-1/6">
        <Link
          href="/dashboard/settings"
          className="flex items-center hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" />
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
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <Headset className="mr-2 h-5 w-5" weight="bold" />
          Assistants
        </Link>
        {/* <Link
          href="/dashboard/integrations"
          className="flex items-center hover:underline"
        >
          <PlugsConnected className="mr-2 h-5 w-5" />
          Connect Apps
        </Link> */}
        <Link
          href="/dashboard/data-sources"
          className="flex items-center hover:underline"
        >
          <Folders className="mr-2 h-5 w-5" />
          Data Sources
        </Link>
      </nav>
      <div className="flex w-full flex-col flex-wrap">
        <Dialog>
          <DialogTrigger asChild className="w-full p-2 sm:w-auto">
            <AnimatedIconButton
              className="mb-4 ml-auto w-full"
              iconPlacement="left"
              IconComponent={<PlusCircle size={20} weight="bold" />}
            >
              <span className="ml-2">Add New Assistant</span>
            </AnimatedIconButton>
          </DialogTrigger>
          <DialogContent className="shadow-glow-lg">
            <CreateAssistantNameForm isTrial={false} />
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 p-4 sm:p-0 md:grid-cols-2 lg:grid-cols-3">
          {assistantsResponse?.data?.map((assistant: Assistant) => (
            <Card
              key={assistant.id}
              className="flex flex-col border border-foreground/20"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      // @ts-ignore
                      src={assistant.config?.imageUrl || ""}
                      alt={assistant.name}
                    />
                    <AvatarFallback className="bg-primary/25">
                      {assistant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/dashboard/assistants/${assistant.id}/settings`}
                      className="font-bold hover:underline"
                    >
                      {assistant.name}
                    </Link>
                    {/* @ts-ignore */}
                    {assistant.config?.description && (
                      <p className="text-sm text-muted-foreground">
                        {/* @ts-ignore */}
                        {assistant.config.description}
                      </p>
                    )}
                  </div>
                  <CopyButton
                    display={`${assistant.name}`}
                    value={`${env.NEXT_PUBLIC_APP_URL}/assistants/${assistant.id}`}
                    className="ml-auto"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">ID: </span> {assistant.id}
                  <span className="ml-2 font-medium">Duration: </span>{" "}
                  {assistant.duration}ms
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  className={`${cn(buttonVariants({ size: "sm", variant: "default" }))}`}
                  href={`${env.NEXT_PUBLIC_APP_URL}/dashboard/assistants/${assistant.id}/settings`}
                >
                  Update Settings
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
