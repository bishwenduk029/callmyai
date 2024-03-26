import Link from "next/link"

import { marketingConfig } from "@/config/marketing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { UserAccountNav } from "@/components/user-account-nav"

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const user = null
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white to-orange-50">
      <header className="container z-40">
        <div className="flex h-20 items-center justify-between py-6 ">
          <MainNav items={marketingConfig.mainNav} />
          {user ? (
            <UserAccountNav
              user={{
                name: "",
                image: "",
                email: "",
              }}
            />
          ) : (
            <nav>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "px-4 text-lg"
                )}
              >
                Login
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
