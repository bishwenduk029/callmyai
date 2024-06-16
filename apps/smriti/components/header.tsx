import * as React from 'react'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { buttonVariants } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { Session } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import SparklesText from './sparkles-text'
import { Brain } from 'lucide-react'

async function UserOrLogin() {
  const session = (await auth()) as Session
  return (
    <>
      <div className="flex items-center">
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <>
            <div className="flex items-center justify-end space-x-2">
              <a
                href="/login"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <span className="hidden ml-2 md:flex">Login</span>
              </a>
              <a href="/register" className={cn(buttonVariants())}>
                <span className="hidden sm:block">Sign Up</span>
                <span className="sm:hidden">Deploy</span>
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
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl shadow-md">
      <div className="flex items-center hover:text-primary">
        <Link
          className="w-full italic font-extrabold text-3xl flex flex-row align-middle group text-foreground"
          href="/"
        >
          <Brain className="text-inherit group-hover:text-primary" size={35} />
          Smriti
        </Link>
      </div>

      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <UserOrLogin />
      </React.Suspense>
    </header>
  )
}
