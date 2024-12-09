"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { CarbonConnectWrapper } from "./carbon-connect-wrapper"

export function DataSources({
  userEmail,
  userId,
  allowedFiles,
  allowedPagesToScrape,
}: {
  userEmail: string
  userId: string
  allowedFiles: number,
  allowedPagesToScrape: number
}) {
  const [isCarbonConnectOpen, setIsCarbonConnectOpen] = useState(false)

  function handleOpenCarbonConnect() {
    setIsCarbonConnectOpen(true)
  }

  return (
    <div className="w-full space-y-4">
      <Card className="flex w-full flex-col items-center justify-center p-6">
        <CardHeader>
          <CardTitle className="text-center">
            Connect and Manage your data sources.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your data sources are managed by{" "}
            <Link className="underline" href="https://carbon.ai/">
              CarbonAI
            </Link>
            .
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
        allowedFiles={allowedFiles}
        allowedPagesToScrape={allowedPagesToScrape}
      />
    </div>
  )
}
