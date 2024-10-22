import { getUserByEmail } from "@/actions/user"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

import { DataSources } from "@/components/data-sources"

export default async function DataSourcesPage() {
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



  return (
    <DataSources
      userEmail={user.data.email}
      userId={user.data.id}
    />
  )
}
