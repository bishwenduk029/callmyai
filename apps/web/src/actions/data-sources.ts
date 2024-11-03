"use server"

import { z } from "zod"

import type { ActionResponse } from "@/types/actions"

import { fetchCarbonAccessToken } from "@/lib/carbon-api"
import { actionClient } from "@/lib/safe-action"

const schema = z.object({
  customerId: z.string(),
})

export const getCarbonAccessToken = actionClient
  .schema(schema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const accessTokenData = await fetchCarbonAccessToken(
        parsedInput.customerId
      )
      return { success: true, data: accessTokenData.access_token }
    } catch (error) {
      console.error("Error fetching Carbon access token:", error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }
    }
  })

const fetchDataSourcesSchema = z.object({
  customerId: z.string(),
})

export const fetchDataSources = actionClient
  .schema(fetchDataSourcesSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      // First, fetch the Carbon access token
      const accessTokenResponse = await fetchCarbonAccessToken(
        parsedInput.customerId
      )
      const accessToken = accessTokenResponse.access_token

      // Now use the access token to fetch data sources
      const response = await fetch(
        "https://api.carbon.ai/integrations/?include_files=true",
        {
          headers: {
            Authorization: `Token ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to retrieve data sources: ${response.statusText}`
        )
      }

      const data = await response.json()

      const activeIntegrations = data.active_integrations
      const fileDetails = activeIntegrations.flatMap(
        (integration: { data_source_type: string; synced_files: any[] }) =>
          integration.synced_files.map(
            (file: { id: string; source: string; name: string }) => ({
              sourceType: integration.data_source_type,
              fileId: file.id,
              fileName: file.name,
            })
          )
      )

      return {
        success: true,
        data: [...fileDetails],
      }
    } catch (error) {
      console.error("Error fetching data sources:", error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching data sources",
      }
    }
  })
