import * as React from "react"
import Script from "next/script"

import { Footer } from "@/components/nav/footer"
import { Header } from "@/components/nav/header"

interface LandingLayoutProps {
  children: React.ReactNode
}

export default function LandingLayout({
  children,
}: LandingLayoutProps): JSX.Element {
  return (
    <div className="flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Script
        id="callmyai-frame"
        strategy="afterInteractive"
        src="https://unpkg.com/@callmyai/iframe@latest/dist/index.js"
        data-assistant-id="67104047-a634-4360-be64-7f2e56a40a25"
      ></Script>
    </div>
  )
}
