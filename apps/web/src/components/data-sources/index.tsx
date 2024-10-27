"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { CarbonConnectWrapper } from "./carbon-connect-wrapper"

export function DataSources({
  userEmail,
  userId,
}: {
  userEmail: string
  userId: string
}) {
  const [isCarbonConnectOpen, setIsCarbonConnectOpen] = useState(false)

  function handleOpenCarbonConnect() {
    setIsCarbonConnectOpen(true)
  }

  return (
    <div className="space-y-4 w-full">
      <Card className="flex flex-col w-full items-center justify-center p-6">
        <CardHeader>
          <CardTitle className="text-center">Add New Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Connect and Manage your data sources.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleOpenCarbonConnect}>Manage Data Sources</Button>
        </CardFooter>
      </Card>
     
      <CarbonConnectWrapper
        isOpen={isCarbonConnectOpen}
        setOpen={setIsCarbonConnectOpen}
        userEmail={userEmail}
      />
    </div>
  )
}
