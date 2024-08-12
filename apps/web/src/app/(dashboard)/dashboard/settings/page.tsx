// page.tsx
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

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
    <div className="container mx-auto mt-5 flex w-full flex-col justify-center space-y-5 text-lg lg:w-1/2">
      <Tabs defaultValue="settings" className="w-full space-y-6">
        <div className="flex w-full justify-center">
          <TabsList>
            <TabsTrigger value="settings" className="text-lg">
              Settings
            </TabsTrigger>
            <TabsTrigger value="call-history" className="text-lg">
              Call History
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="settings">
          <Settings
            user={{
              id: user.id,
              username: user.username,
              systemPrompt: user.systemPrompt,
            }}
          />
        </TabsContent>
        <TabsContent value="call-history">
          <h2 className="mb-4 font-inter text-3xl font-extrabold tracking-tight sm:text-3xl">
            Call history
          </h2>
          <CallSummaries userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
