import * as React from "react"
import { redirect } from "next/navigation"

import { DEFAULT_UNAUTHENTICATED_REDIRECT } from "@/config/defaults"

import auth from "@/lib/auth"

import { Header } from "@/components/nav/header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<JSX.Element> {
  const session = await auth()
  if (!session) redirect(DEFAULT_UNAUTHENTICATED_REDIRECT)

  return (
    <div>
      <Header />
      <div className="container mx-auto flex w-full flex-row justify-center space-x-12 text-lg lg:w-3/4">
        {children}
      </div>
    </div>
  )
}
