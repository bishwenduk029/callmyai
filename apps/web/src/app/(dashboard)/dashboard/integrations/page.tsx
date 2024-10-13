import { redirect } from "next/navigation"
import { getIntegrationsByUserId } from "@/actions/integration"
import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"

import { Integration } from "@/db/schema"

import IntegrationsClient from "@/components/integrations/client"

export default async function IntegrationsPage() {
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

  const integrationsResult = await getIntegrationsByUserId({
    userId: user.data.id,
  })

  return (
    <IntegrationsClient
      userEmail={user.data.email}
      userId={user.data.id}
      integrations={integrationsResult?.data?.data as Integration[]}
    />
  )
}
