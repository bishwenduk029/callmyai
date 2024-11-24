"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserByEmail, updateUserCalls } from "@/actions/user"
import { Environments, initializePaddle } from "@paddle/paddle-js"

import { cn } from "@/lib/utils"

import { Button, buttonVariants } from "@/components/ui/button"

interface PricingButtonProps {
  planId: string
  paddlePriceId?: string
  buttonText: string
  isDisabled: boolean
  userEmail: string
}

export function PricingButton({
  planId,
  paddlePriceId,
  buttonText,
  isDisabled,
  userEmail,
}: PricingButtonProps) {
  const router = useRouter()
  const [paddle, setPaddle] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    async function initPaddle() {
      if (
        isInitializing ||
        paddle?.Initialized ||
        !process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
      )
        return

      setIsInitializing(true)
      try {
        const paddleInstance = await initializePaddle({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        })
        setPaddle(paddleInstance)
      } catch (error) {
        console.error("Failed to initialize Paddle:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initPaddle()
  }, [])

  async function handleSubscription() {
    if (planId === "free") {
      const user = await getUserByEmail({
        email: userEmail,
      })
      if (!user?.data?.calls) {
        await updateUserCalls(user?.data?.id || "", user?.data?.calls || 50)
      }
      router.push("/dashboard/settings")
      return
    }

    if (!paddle?.Initialized) return

    try {
      await paddle.Checkout.open({
        customer: { email: userEmail },
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
          // successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        },
      })
    } catch (error) {
      console.error("Failed to open Paddle checkout:", error)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubscription()
      }}
    >
      <Button
        type="submit"
        disabled={isDisabled}
        className={cn(
          buttonVariants({
            variant: "default",
            className: "mt-4 w-full text-secondary",
          })
        )}
      >
        {buttonText}
      </Button>
    </form>
  )
}
