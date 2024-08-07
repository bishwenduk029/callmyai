"use server"

import { db } from "@/config/db"
import { promptTemplates } from "@/db/schema"

export async function getPromptTemplates() {
  try {
    const templates = await db.select().from(promptTemplates)
    return templates
  } catch (error) {
    console.error("Failed to fetch prompt templates:", error)
    return []
  }
}