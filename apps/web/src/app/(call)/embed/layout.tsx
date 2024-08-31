import * as React from "react"

import { Logo } from "@/components/nav/logo"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<JSX.Element> {
  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          backgroundColor: "black",
          color: "white",
          textAlign: "center",
          padding: "10px 0",
          zIndex: 1000,
        }}
      >
        Talk to me now
      </div>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          backgroundColor: "black",
          color: "white",
          textAlign: "center",
          padding: "10px 0",
        }}
      >
        <div className="flex flex-row justify-center space-x-2">
          <span>Powered By</span>
          {" "}
          <Logo />
          {" "}
          <span>CallMyAI</span>
        </div>
      </div>
    </div>
  )
}