import Script from "next/script"
import * as React from "react"

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
        src="/index.js"
      ></Script>
    </div>
  )
}
