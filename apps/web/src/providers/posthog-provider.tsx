'use client'

import posthog from 'posthog-js'
import { PostHogProvider as OriginalPostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { env } from '@/env.mjs'

if (typeof window !== 'undefined') {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false // We'll handle this manually
  })
}

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams?.toString()) 
        url = url + `?${searchParams.toString()}`
      
      posthog.capture('$pageview', {
        $current_url: url
      })
    }
  }, [pathname, searchParams])

  return <OriginalPostHogProvider client={posthog}>{children}</OriginalPostHogProvider>
} 