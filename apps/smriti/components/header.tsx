import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { Session } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import SparklesText from './sparkles-text'
import { Brain } from 'lucide-react'
import { SmritiNav } from './smriti-nav'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { getCurrentUser } from '@/app/auth/actions'

async function UserOrLogin() {
  const user = await getCurrentUser()
  return (
    <>
      <div className="flex items-center">
        {user ? (
          <UserMenu user={{ id: user.id, email: user.email || '' }} />
        ) : (
          <>
            <div className="flex items-center justify-end space-x-2">
              <a
                href="/auth/login"
                rel="noopener noreferrer"
                className={`${cn(buttonVariants({ variant: 'outline' }))} hidden ml-2 md:flex`}
              >
                <span className="hidden ml-2 md:flex">Login</span>
              </a>
              <a href="/auth/register" className={cn(buttonVariants())}>
                <span className="hidden sm:block">Sign Up</span>
                <span className="sm:hidden">Sign Up</span>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex flex-row items-center justify-between w-full h-16 px-4 shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="sm:mx-auto flex flex-row justify-center items-center space-x-5">
        <Link
          className="w-full italic font-extrabold text-2xl flex flex-row align-middle group text-foreground"
          href="/"
        >
          <Brain className="text-inherit group-hover:text-primary" size={30} />
          Smriti
        </Link>
        <SmritiNav />
      </div>

      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <UserOrLogin />
      </React.Suspense>
    </header>
  )
}
