'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface PaidFeatureNoticeProps {
  feature: "createAssistant" | "externalApps" | "externalFiles"
}

function PaidFeatureNotice({ feature }: PaidFeatureNoticeProps): JSX.Element {
  const router = useRouter()

  return (
    <Card className="w-full max-w-fit text-xl mx-4 sm:mx-none">
      <CardHeader>
        <CardTitle>Premium Feature</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {featureMessages[feature]}
        </p>
      </CardContent>
    </Card>
  )
}

const featureMessages = {
  createAssistant: 'Creating additional assistants is available on our paid plans. Upgrade to create AI assistants tailored to your needs.',
  externalApps: 'Connecting external apps requires a paid subscription. Unlock the full potential by upgrading your plan.',
  externalFiles: 'File upload and processing features are available on our paid plans. Upgrade to connect and process external files.',
} as const

export { PaidFeatureNotice } 