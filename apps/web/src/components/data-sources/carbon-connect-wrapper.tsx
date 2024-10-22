"use client"

import { useState } from "react"
import { getCarbonAccessToken } from "@/actions/data-sources"
import {
  AutoSyncedSourceTypes,
  CarbonConnect,
  EmbeddingGenerators,
  IntegrationName,
} from "carbon-connect"

interface CarbonConnectWrapperProps {
  userEmail: string
  isOpen: boolean
  onClose: () => void
}

export function CarbonConnectWrapper({
  userEmail,
  isOpen,
  onClose,
}: CarbonConnectWrapperProps) {

  const tokenFetcher = async (): Promise<{ access_token: string }> => {
    try {
      const result = await getCarbonAccessToken({
        customerId: userEmail,
      })
  
      if (!result) {
        throw new Error("Failed to get Carbon access token: No result returned")
      }
  
      if (!result.data?.success) {
        throw new Error(
          `Failed to get Carbon access token: ${result.data?.error || "Unknown error"}`
        )
      }
  
      if (!result.data || typeof result.data.data.access_token !== "string") {
        throw new Error(
          "Failed to get Carbon access token: Invalid data returned"
        )
      }
  
      return { access_token: result.data.data.access_token }
    } catch (error) {
      console.error("Error fetching Carbon access token:", error)
      throw new Error(
        "Failed to get Carbon access token. Please try again later."
      )
    }
  }

  const handleSuccess = (data: any) => {
    console.log("Data on Success: ", data)
  }

  const handleError = (error: any) => {
    console.log("Data on Error: ", error)
  }

  return (
    <CarbonConnect
      orgName="CallMyAI"
      brandIcon="/images/headset.png"
      embeddingModel={EmbeddingGenerators.OPENAI}
      tokenFetcher={tokenFetcher}
      tags={{
        tag1: "tag1_value",
        tag2: "tag2_value",
        tag3: "tag3_value",
      }}
      maxFileSize={10000000}
      enabledIntegrations={[
        {
          id: IntegrationName.LOCAL_FILES,
          maxFileSize: 20000000,
          allowedFileTypes: [
            {
              extension: "csv",
            },
            {
              extension: "txt",
            },
            {
              extension: "pdf",
            },
          ],
        },
        {
          id: IntegrationName.NOTION,
        },
        {
          id: IntegrationName.WEB_SCRAPER,
        },
        {
          id: IntegrationName.GOOGLE_DRIVE,
        },
        {
          id: IntegrationName.INTERCOM,
        },
      ]}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  )
}
