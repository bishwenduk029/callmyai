"use client"

import { getCarbonAccessToken, fetchDataSources } from "@/actions/data-sources"
import {
  AutoSyncedSourceTypes,
  CarbonConnect,
  EmbeddingGenerators,
  IntegrationName,
} from "carbon-connect"
import { Carbon } from "carbon-typescript-sdk"

import { integrations } from "../../db/schema/index"

interface CarbonConnectWrapperProps {
  userEmail: string
  isOpen: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function CarbonConnectWrapper({
  userEmail,
  isOpen,
  setOpen,
}: CarbonConnectWrapperProps) {
  const tokenFetcher = async (): Promise<{ access_token: string }> => {
    try {
      const result = await getCarbonAccessToken({
        customerId: userEmail,
      })

      if (!result?.data?.success || !result?.data?.data) {
        throw new Error(
          `Failed to get Carbon access token: ${result?.data?.error || "Unknown error"}`
        )
      }

      const accessToken = result.data.data

      // Fetch data sources using the new action
      const dataSources = await fetchDataSources({ customerId: userEmail })

      if (!dataSources?.data?.success) {
        throw new Error(
          `Failed to fetch data sources: ${dataSources?.data?.error || "Unknown error"}`
        )
      }

      // // Test the embeddings API endpoint
      // const embeddingsResponse = await fetch("https://api.carbon.ai/embeddings", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Token ${accessToken}`
      //   },
      //   body: JSON.stringify({
      //     query: "Whose salary structure is being discussed in this document?",
      //     file_ids: fileIds,
      //     k: 2,
      //     include_tags: false,
      //     include_vectors: false,
      //     include_raw_file: false,
      //     hybrid_search: false,
      //     media_type: "TEXT",
      //     embedding_model: "OPENAI",
      //     include_file_level_metadata: false,
      //     high_accuracy: true
      //   })
      // });

      // if (!embeddingsResponse.ok) {
      //   throw new Error(`Embeddings API error! status: ${embeddingsResponse.status}`);
      // }

      // const embeddingsResult = await embeddingsResponse.json();
      // console.log("Embeddings API response:", embeddingsResult);

      return { access_token: accessToken }
    } catch (error) {
      console.error("Error in tokenFetcher:", error)
      throw new Error(
        "Failed to get Carbon access token or fetch data sources. Please try again later."
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
      open={isOpen}
      setOpen={setOpen}
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
