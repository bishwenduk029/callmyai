import Link from "next/link"

import { siteConfig } from "@/config/site"

import auth from "@/lib/auth"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/auth/signout-button"
import { Icons } from "@/components/icons"
import { Navigation } from "@/components/nav/navigation"
import { NavigationMobile } from "@/components/nav/navigation-mobile"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "./logo"

export async function Header({showThemeToggle = true}): Promise<JSX.Element> {
  const session = await auth()

  return (
    <header className="fade-bottom sticky top-0 z-50 px-4 pb-4 backdrop-blur-lg">
      <div className="container flex items-center justify-between p-4">
        <Logo />
        <Navigation navItems={siteConfig.navItems} />
        <div className="flex items-center justify-center">
          {showThemeToggle && <ThemeToggle />}
          <NavigationMobile navItems={siteConfig.navItems} />

          <nav className="space-x-1">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className={cn(
                    buttonVariants({ variant: "user", size: "icon" }),
                    "transition-all duration-300 ease-in-out hover:opacity-70"
                  )}
                >
                  <Avatar className="size-9">
                    {session?.user.image ? (
                      <AvatarImage
                        src={session?.user.image}
                        alt={session?.user.name ?? "user's profile picture"}
                        className="size-7 rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="size-9 cursor-pointer p-1.5 text-xs capitalize">
                        <Icons.user className="size-5 rounded-full" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                aria-label="Sign Up"
                href="/dashboard/settings"
                className={`${cn(buttonVariants({ size: "md", variant: "default" }), "ml-2")} cursor-pointer text-background`}
              >
                Sign Up
                <span className="sr-only text-background">Sign Up</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
