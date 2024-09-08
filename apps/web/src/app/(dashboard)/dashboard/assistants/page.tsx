// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAssistantsByUserId } from "@/actions/assistant"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import {
  Gear,
  Headset,
  PhoneIncoming,
  Plus,
  PlusCircle,
} from "@phosphor-icons/react/dist/ssr"
import { motion } from "framer-motion"

import { env } from "@/env.mjs"
import { Assistant } from "@/db/schema"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AnimatedIconButton } from "@/components/animated/plus-icon"
import { CreateAssistantNameForm } from "@/components/assistant/create-assistant-name-form"
import { CopyButton } from "@/components/copy-button"

export default async function AssistantsPage() {
  const session = await auth()

  if (!session) redirect("/signin")

  const user = await getUserByEmail({ email: session.user.email || "" })

  if (!user || !user.data) redirect("/signin")

  const assistantsResponse = await getAssistantsByUserId({
    userId: user.data.id,
  })

  if (!assistantsResponse) {
    redirect("/error")
  }

  return (
    <>
      <nav className="mx-3 mt-3 hidden max-h-5 gap-4 text-md text-muted-foreground sm:grid">
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
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <Headset className="mr-2 h-5 w-5" weight="bold" />
          Assistants
        </Link>
      </nav>
      <div className="flex w-full flex-col flex-wrap">
        <Dialog>
          <DialogTrigger asChild>
            <AnimatedIconButton
              className="mb-4 ml-auto"
              iconPlacement="left"
              IconComponent={<PlusCircle size={20} weight="bold" />}
            >
              <span className="ml-2">Add New Assistant</span>
            </AnimatedIconButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assistant</DialogTitle>
              <DialogDescription>
                You can update and configure your assistant later.
              </DialogDescription>
            </DialogHeader>
            <CreateAssistantNameForm />
          </DialogContent>
        </Dialog>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Web Link</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Phone Number
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Cost per Minute
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assistantsResponse?.data?.map((assistant: Assistant) => (
                  <TableRow key={assistant.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/assistants/${assistant.id}/settings`}
                        className="font-bold hover:underline"
                      >
                        {assistant.id}
                      </Link>
                    </TableCell>
                    <TableCell>{assistant.name}</TableCell>
                    <TableCell>
                      <CopyButton
                        className="w-full"
                        value={`${env.NEXT_PUBLIC_APP_URL}/assistants/${assistant.id}`}
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      coming soon
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      coming soon
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
