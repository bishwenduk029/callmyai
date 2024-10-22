"use server"

import axios from "axios"
import { z } from "zod"

import type { ActionResponse } from "@/types/actions"

import { actionClient } from "@/lib/safe-action"

const schema = z.object({
  customerId: z.string(),
})

export const getCarbonAccessToken = actionClient
  .schema(schema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const response = await axios.get(
        "https://api.carbon.ai/auth/v1/access_token",
        {
          headers: {
            "Content-Type": "application/json",
            "customer-id": parsedInput.customerId,
            "Authorization": "Bearer a37883f68c77ae01ea5b72e29d759a1a325da9861e112955e732aed92b471f30",
          },
        }
      )

      if (response.status === 200 && response.data) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: "Failed to retrieve access token" }
      }
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
