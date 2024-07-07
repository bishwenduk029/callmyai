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

  return <div><Header />{children}</div>
}
