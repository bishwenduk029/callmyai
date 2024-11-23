'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info } from "@phosphor-icons/react/dist/ssr"
import { useRouter } from "next/navigation"

interface PremiumFeatureNoticeProps {
  feature: keyof typeof featureMessages
}

export function PremiumFeatureNotice({ feature }: PremiumFeatureNoticeProps): JSX.Element {
  const router = useRouter()

  return (
    <Alert variant="default" className="w-full max-w-3xl mx-auto mt-4 border-primary/50 bg-green-600">
      <Info className="h-5 w-5 text-white" />
      <AlertTitle className="text-white font-semibold ml-2">Premium Feature</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between text-green-100">
        <span className="text-sm mr-4">
          {featureMessages[feature]}
        </span>
      </AlertDescription>
    </Alert>
  )
}

const featureMessages = {
  createAssistant: 'Creating additional assistants is available on our paid plans. Upgrade to create AI assistants tailored to your needs.',
  externalApps: 'Connecting external apps requires a paid subscription. Unlock the full potential by upgrading your plan.',
  externalFiles: 'File upload and processing features are available on our paid plans. Upgrade to connect and process external files.',
} as const
