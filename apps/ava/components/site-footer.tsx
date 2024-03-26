import * as React from "react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-baseline gap-4 px-8 md:flex-row md:gap-2 md:px-0">
        <span className="text-2xl">✍️</span>
          <p className="text-center text-sm leading-loose md:text-left">
            Contact Us{" "}
            <a
              href={siteConfig.links.email}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Ava
            </a>
            .
            <a
              href={siteConfig.links.privacy}
              target="_blank"
              rel="noreferrer"
              className="mx-2 font-medium text-foreground underline underline-offset-4"
            >
              Privacy
            </a>
          </p>
        </div>
        {/* <ModeToggle /> */}
      </div>
    </footer>
  )
}
