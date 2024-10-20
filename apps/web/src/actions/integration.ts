"use server"

import axios from "axios"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { ActionResponse } from "@/types/actions"
import { db } from "@/config/db"
import { psGetIntegrationsByUserId } from "@/db/prepared/statements"
import { integrations } from "@/db/schema"

import { createComposioLink } from "@/lib/composio"
import { actionClient } from "@/lib/safe-action"

interface ExternalApp {
  appId: string
  key: string
  name: string
  description: string
  logo: string
  categories: string
  enabled: boolean
  no_auth: boolean
}

interface ExternalAppsResponse {
  items: ExternalApp[]
  totalPages: number
}

const fetchExternalAppsAction = actionClient.action(
  async (): Promise<ActionResponse> => {
    try {
      const response = await axios.get<ExternalAppsResponse>(
        "https://backend.composio.dev/api/v1/apps",
        {
          headers: {
            "X-API-Key": process.env.COMPOSIO_API_KEY,
          },
        }
      )

      const { items, totalPages } = response.data

      return { success: true, data: { items, totalPages } }
    } catch (error) {
      console.error(
        "Error fetching external apps:",
        error instanceof Error ? error.message : String(error)
      )
      return { success: false, error: "Failed to fetch external apps" }
    }
  }
)

interface AppAction {
  appId: string
  appKey: string
  appName: string
  description: string
  displayName: string
  enabled: boolean
  logo: string
  name: string
  parameters: Record<string, unknown>
  response: Record<string, unknown>
  tags: string[]
}

interface AppActionsResponse {
  items: AppAction[]
  page: number
  totalPages: number
}

const fetchAppActionsAction = actionClient
  .schema(z.object({ appName: z.string() }))
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const response = await axios.get<AppActionsResponse>(
        `https://backend.composio.dev/api/v2/actions/list/all?apps=${parsedInput.appName}`,
        {
          headers: {
            "X-API-Key": process.env.COMPOSIO_API_KEY,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        }
      )

      const { items, page, totalPages } = response.data

      return { success: true, data: { items, page, totalPages } }
    } catch (error) {
      console.error(
        "Error fetching app actions:",
        error instanceof Error ? error.message : String(error)
      )
      return { success: false, error: "Failed to fetch app actions" }
    }
  })

export { fetchExternalAppsAction, fetchAppActionsAction }
export type { ExternalApp, AppAction }

const schema = z.object({
  userEmail: z.string().email(),
  appId: z.string(),
})

export const createComposioLinkAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const { userEmail, appId } = parsedInput
      const link = await createComposioLink(userEmail, appId)
      return { success: true, data: { link } }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected error occurred",
      }
    }
  })

const integrationCreateSchema = z.object({
  userId: z.string(),
  connectedAccountName: z.string(),
  appId: z.string(),
  key: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
  categories: z.string().optional(),
  enabled: z.boolean().default(true),
  noAuth: z.boolean().default(false),
  availableActions: z.array(z.string()).default([]),
})

export const createIntegration = actionClient
  .schema(integrationCreateSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const [newIntegration] = await db
        .insert(integrations)
        .values({
          userId: parsedInput.userId,
          connectedAccountName: parsedInput.connectedAccountName,
          appId: parsedInput.appId,
          key: parsedInput.key,
          description: parsedInput.description,
          logo: parsedInput.logo,
          availableActions: parsedInput.availableActions,
        })
        .returning()

      return { success: true, data: newIntegration }
    } catch (error) {
      console.error("Error creating integration:", error)
      return { success: false, error: "Failed to create integration" }
    }
  })

const integrationUpdateSchema = z.object({
  integrationId: z.string(),
  availableActions: z.array(z.string()).nullable().optional(),
})

export const updateIntegration = actionClient
  .schema(integrationUpdateSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const { integrationId, availableActions } = parsedInput

      const [updatedIntegration] = await db
        .update(integrations)
        .set({ availableActions })
        .where(eq(integrations.id, integrationId))
        .returning()

      if (!updatedIntegration) {
        return { success: false, error: "Integration not found" }
      }

      return { success: true, data: updatedIntegration }
    } catch (error) {
      console.error("Error updating integration actions:", error)
      return { success: false, error: "Failed to update integration actions" }
    }
  })

export const getIntegrationsByUserId = actionClient
  .schema(z.object({ userId: z.string().optional() }))
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const userIntegrations = await psGetIntegrationsByUserId.execute({
        userId: parsedInput.userId,
      })
      return { success: true, data: userIntegrations }
    } catch (error) {
      console.error("Error fetching integrations:", error)
      return { success: false, error: "Failed to fetch integrations" }
    }
  })
