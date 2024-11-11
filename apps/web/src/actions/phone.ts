"use server"

import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/config/db"
import { users } from "@/db/schema/index"

import { createAppError } from "@/lib/error"
import { actionClient } from "@/lib/safe-action"

const phoneSchema = z.object({
  phoneNumber: z.string(),
  userId: z.string(),
})

export const updateUserPhoneNumber = actionClient
  .schema(phoneSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Update user's phone number in database
      await db
        .update(users)
        .set({ phone: parsedInput.phoneNumber })
        .where(eq(users.id, parsedInput.userId))
      return { success: true, message: "Phone number updated successfully" }
    } catch (error) {
      console.error("Error updating phone number:", error)
      return { success: false, error: "Failed to update phone number" }
    }
  })

export const purchasePhoneNumber = actionClient
  .schema(phoneSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Purchase phone number from Daily API
      const response = await fetch("https://api.daily.co/v1/buy-phone-number", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DAILY_TELEPHONY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: parsedInput.phoneNumber }),
      })

      if (!response.ok) throw new Error("Failed to purchase number")

      // Setting up a Pinless Dial-in phone number
      const pinlessResponse = await fetch("https://api.daily.co/v1", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DAILY_TELEPHONY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            pinless_dialin: [
              {
                phone_number: parsedInput.phoneNumber,
                room_creation_api: process.env.DAILY_DIALIN_URL,
              },
            ],
          },
        }),
      })

      if (!pinlessResponse.ok) {
        throw new Error("Failed to configure pinless dial-in")
      }

      // Update user's phone number in database
      await db
        .update(users)
        .set({ phone: parsedInput.phoneNumber })
        .where(eq(users.id, parsedInput.userId))

      return { success: true, message: "Phone number purchased successfully" }
    } catch (error) {
      console.error("Error purchasing phone number:", error)
      return { success: false, error: "Failed to purchase phone number" }
    }
  })

const releaseSchema = z.object({
  userId: z.string(),
})

const appErrors = {
  UNEXPECTED_ERROR: createAppError({
    code: "UNEXPECTED_ERROR",
    message: "An unexpected error occurred",
  }),
  PHONE_RELEASE_ERROR: createAppError({
    code: "PHONE_RELEASE_ERROR",
    message:
      "Failed to release phone number. It may be too soon to release this number.",
  }),
  USER_NOT_FOUND: createAppError({
    code: "USER_NOT_FOUND",
    message: "User not found",
  }),
} as const

export const releasePhoneNumber = actionClient
  .schema(releaseSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Get user's current phone number
      const user = await db
        .select({ phone: users.phone })
        .from(users)
        .where(eq(users.id, parsedInput.userId))
        .limit(1)

      if (!user?.[0]?.phone)
        return { success: false, error: appErrors.USER_NOT_FOUND }

      // // Release phone number via Daily API
      // const response = await fetch(
      //   `https://api.daily.co/v1/release-phone-number/${user[0].phone}`,
      //   {
      //     method: "DELETE",
      //     headers: {
      //       Authorization: `Bearer ${process.env.DAILY_TELEPHONY_API_KEY}`,
      //     },
      //   }
      // )

      // if (!response.ok) {
      //   const error = await response.json()
      //   console.error("Failed to release phone number:", error)
      //   return { success: false, error: appErrors.PHONE_RELEASE_ERROR }
      // }

      // Update user record to remove phone number
      await db
        .update(users)
        .set({ phone: null })
        .where(eq(users.id, parsedInput.userId))

      return { success: true, message: "Phone number released successfully" }
    } catch (error) {
      console.error("Error releasing phone number:", error)
      return {
        success: false,
        error: appErrors.UNEXPECTED_ERROR,
      }
    }
  })
