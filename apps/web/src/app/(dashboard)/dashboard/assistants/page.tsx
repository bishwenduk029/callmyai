// page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAssistantsByUserId } from "@/actions/assistant"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import { PlusCircle } from "@phosphor-icons/react/dist/ssr"

import { env } from "@/env.mjs"
import { Assistant } from "@/db/schema"

import { Button } from "@/components/ui/button"
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

  if (!assistantsResponse) redirect("/error")

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link href={"/dashboard/settings"}>Settings</Link>
        <Link href={"/dashboard/calls"}>Calls</Link>
        <Link
          href={"/dashboard/assistants"}
          className="font-semibold text-primary"
        >
          Assistants
        </Link>
      </nav>
      <div className="mt-6 w-full flex-col">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="align-end self-end">
              <PlusCircle size={20} weight="bold" className="mr-2"></PlusCircle>
              Add Assistant
            </Button>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Web Link</TableHead>
              <TableHead className="hidden sm:table-cell">Phone Number</TableHead>
              <TableHead className="hidden sm:table-cell">Cost per Minute</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assistantsResponse?.data?.map((assistant: Assistant) => (
              <TableRow key={assistant.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/assistants/${assistant.id}/settings`}
                    passHref
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
      </div>
    </>
  )
}
