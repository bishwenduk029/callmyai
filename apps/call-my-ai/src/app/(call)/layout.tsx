import * as React from "react"
import { Header } from "@/components/nav/header"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<JSX.Element> {

  return <div><Header />{children}</div>
}
