// page.tsx
import { redirect } from "next/navigation"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"

import { CallSummaries } from "@/components/calls"
import Settings from "@/components/settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/signin")
  }

  const user = await getUserByEmail({
    email: session.user.email || "",
  })

  if (!user) {
    redirect("/signin")
  }

  return (
    <div className="container w-full lg:w-1/2 mx-auto mt-5 flex flex-col justify-center space-y-5 text-lg">
      <Tabs defaultValue="settings" className="w-full space-y-6">
        <div className="flex justify-center w-full">
          <TabsList>
            <TabsTrigger value="settings" className="text-lg">Settings</TabsTrigger>
            <TabsTrigger value="call-history" className="text-lg">Call History</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="settings">
          <Settings user={{ id: user.id, username: user.username, systemPrompt: user.systemPrompt }} />
        </TabsContent>
        <TabsContent value="call-history">
          <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl mb-4">
            Call history
          </h2>
          <CallSummaries userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
