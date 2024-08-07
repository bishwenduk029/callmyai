"use server"

import { revalidatePath } from "next/cache"
import {
  psCheckExistingUsername,
  psUpdateUserUsername,
} from "@/db/prepared/statements"

export async function updateUserHandle(userId: string, formData: FormData) {
  const username = formData.get("username")?.toString()

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

    // Update username
    await psUpdateUserUsername.execute({ id: userId, username })

    revalidatePath("/settings")
    return { success: "Username updated successfully" }
  } catch (error) {
    console.error("Error updating username:", error)
    return { error: "An error occurred while updating username" }
  }
}
