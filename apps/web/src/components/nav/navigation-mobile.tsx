"use client"

import type { NavItem } from "@/types"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import * as React from "react"

import { siteConfig } from "@/config/site"

import { cn } from "@/lib/utils"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { Headset, PhoneIncoming } from "@phosphor-icons/react"
import { Separator } from "../ui/separator"

interface NavigationMobileProps {
  navItems: NavItem[]
}

interface MobileLinkProps extends React.PropsWithChildren {
  href: string
  disabled?: boolean
  segment: string
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function MobileLink({
  children,
  href,
  disabled,
  segment,
  setIsOpen,
}: MobileLinkProps): JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground flex-row gap-2",
        href.includes(segment) && "text-foreground",
        disabled && "pointer-events-none opacity-60"
      )}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  )
}

export function NavigationMobile({ navItems }: NavigationMobileProps) {
  const segment = useSelectedLayoutSegment()
  const [isOpen, setIsOpen] = React.useState<boolean>(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className="transition-all duration-300 ease-in-out">
        <Button variant="navbarIcon" size="icon" className="md:hidden">
          <Icons.menuToggle className="size-5" aria-hidden="true" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-10 transition-all duration-300 ease-in-out"
      >
        <div className="pl-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <Headset className="mr-2 size-8" aria-hidden="true" />
            <span className="text-2xl font-bold leading-none tracking-wide">
              {siteConfig.name}
            </span>
            <span className="sr-only">Home</span>
          </Link>
        </div>
        <div className="flex flex-col gap-4 pl-16 text-xl font-medium leading-none tracking-wide">
          <MobileLink
            key={"calls"}
            href="/dashboard/calls"
            segment={String(segment)}
            setIsOpen={setIsOpen}
          >
            <span className="flex flex-row items-center gap-2">
              <PhoneIncoming className="size-5" />
              <span>Calls</span>
            </span>
          </MobileLink>
          <MobileLink
            key={"settings"}
            href="/dashboard/settings"
            segment={String(segment)}
            setIsOpen={setIsOpen}
          >
            <span className="flex flex-row items-center gap-2">
              <Icons.settings className="size-5" aria-hidden="true" />
              <span>Settings</span>
            </span>
          </MobileLink>
          <MobileLink
            key={"assistants"}
            href="/dashboard/assistants"
            segment={String(segment)}
            setIsOpen={setIsOpen}
          >
            <span className="flex flex-row items-center gap-2">
              <Headset className="size-5" />
              <span>Assistants</span>
            </span>
          </MobileLink>
          <MobileLink
            key={"integrations"}
            href="/dashboard/integrations"
            segment={String(segment)}
            setIsOpen={setIsOpen}
          >
            <span className="flex flex-row items-center gap-2">
              <Headset className="size-5" />
              <span>Integrations</span>
            </span>
          </MobileLink>
          <Separator />
          {navItems.map((item) => (
            <MobileLink
              key={item.title}
              href={item.href}
              segment={String(segment)}
              setIsOpen={setIsOpen}
            >
              {item.title}
            </MobileLink>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
