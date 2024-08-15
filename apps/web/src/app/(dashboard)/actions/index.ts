"use server"

import { revalidatePath } from "next/cache"

import {
  psCheckExistingUsername,
  psUpdateUserUsernameAndSystemPrompt,
} from "@/db/prepared/statements"

export async function updateUserHandle(userId: string, formData: FormData) {
  const username = formData.get("username")?.toString()
  const systemPrompt = formData.get("systemPrompt")?.toString()

  if (!username) {
    return { error: "Username is required" }
  }

  try {
    // Check if username already exists
    const existingUser = await psCheckExistingUsername.execute({
      username,
      id: userId,
    })

    if (existingUser.length > 0) {
      return { error: "Username already taken" }
    }

    // Update username and systemPrompt
    await psUpdateUserUsernameAndSystemPrompt.execute({
      id: userId,
      username,
      systemPrompt,
    })

    revalidatePath("/settings")
    return { success: "Username and system prompt updated successfully" }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "An error occurred while updating user information" }
  }
}
