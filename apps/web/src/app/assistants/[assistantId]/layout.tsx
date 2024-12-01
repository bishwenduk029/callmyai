import * as React from "react"
import Link from "next/link"
import { Headset } from "@phosphor-icons/react/dist/ssr"

interface CallMyAIFrameLayoutProps {
  children: React.ReactNode
}

export default async function CallMyAIFrameLayout({
  children,
}: CallMyAIFrameLayoutProps): Promise<JSX.Element> {
  return (
    <div>
      {children}
      <div className="fixed bottom-0 w-full bg-black py-2.5 text-center text-foreground dark:text-background">
        <div className="flex flex-row justify-center space-x-2">
          <span className="text-primary-foreground dark:text-foreground">
            Powered By
          </span>{" "}
          <Headset size={25} className="text-green-300" />{" "}
          <Link
            className="font-bold tracking-wide text-primary-foreground underline-offset-4 transition-colors hover:underline dark:text-foreground"
            href="https://callmyai.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CallMyAI
          </Link>
        </div>
      </div>
    </div>
  )
}
