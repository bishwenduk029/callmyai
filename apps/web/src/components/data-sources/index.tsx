'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CarbonConnectWrapper } from './carbon-connect-wrapper'

export function DataSources({userEmail, userId}: {userEmail: string, userId: string}) {
  const [isCarbonConnectOpen, setIsCarbonConnectOpen] = useState(false)

  function handleOpenCarbonConnect() {
    setIsCarbonConnectOpen(true)
  }

  function handleCloseCarbonConnect() {
    setIsCarbonConnectOpen(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Data Sources</h2>
      <Button onClick={handleOpenCarbonConnect}>Connect Data Source</Button>
      <CarbonConnectWrapper isOpen={isCarbonConnectOpen} onClose={handleCloseCarbonConnect} userEmail={userEmail} />
    </div>
  )
}
