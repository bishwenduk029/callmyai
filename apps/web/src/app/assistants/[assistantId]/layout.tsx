import { Headset } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import * as React from "react"


interface CallMyAIFrameLayoutProps {
  children: React.ReactNode
}

export default async function CallMyAIFrameLayout({
  children,
}: CallMyAIFrameLayoutProps): Promise<JSX.Element> {
  return (
    <div>
      {children}
      <div className="fixed bottom-0 w-full bg-black py-2.5 text-center text-white">
        <div className="flex flex-row justify-center space-x-2">
          <span className="text-white">Powered By</span>{" "}
          <Headset size={25} className="text-green-300" />{" "}
          <Link
            className="font-bold tracking-wide text-white underline-offset-4 transition-colors hover:underline"
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
