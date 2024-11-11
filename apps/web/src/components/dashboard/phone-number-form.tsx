"use client"

import { useState } from "react"
import {
  purchasePhoneNumber,
  releasePhoneNumber,
  updateUserPhoneNumber,
} from "@/actions/phone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { User } from "@/db/schema/index"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Icons } from "../icons"

const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Please enter a valid phone number in E.164 format (e.g., +1234567890)"
    ),
})

interface PhoneNumberFormProps {
  user: User & {
    phoneNumber?: string | null
  }
}

export function PhoneNumberForm({ user }: PhoneNumberFormProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: user.phone || undefined,
    },
  })

  const { execute: executeUserPhoneNumberUpdate, status } = useAction(
    updateUserPhoneNumber,
    {
      onSuccess: (data) => {
        if (data.data?.success) {
          toast({
            title: "Success",
            description: data.data.message,
          })
          form.reset()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data?.data?.error,
          })
        }
      },
    }
  )

  const { execute: executeRelease, status: releaseStatus } = useAction(
    releasePhoneNumber,
    {
      onSuccess: (data) => {
        if (data.data?.success) {
          toast({
            title: "Success",
            description: data.data.message,
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data?.data?.error?.message,
          })
        }
      },
    }
  )

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    executeUserPhoneNumberUpdate({
      phoneNumber: data.phoneNumber,
      userId: user.id,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Twilio Virtual Phone Number</CardTitle>
        <CardDescription>
          Connect your Twilio Virtual Phone Number to receive incoming calls.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {user.phone ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    Connected Number:
                  </p>
                  <p className="text-lg font-medium">{user.phone}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={(event) => {
                    event.preventDefault()
                    executeRelease({ userId: user.id })
                  }}
                  disabled={releaseStatus === "executing"}
                >
                  {releaseStatus === "executing" ? (
                    <>
                      <Icons.spinner
                        className="mr-2 size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect Number"
                  )}
                </Button>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twilio Virtual Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your Twilio Virtual Phone Number in E.164 format
                      (e.g., +1234567890)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            {!user.phone && (
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? (
                  <>
                    <Icons.spinner
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Connecting...
                  </>
                ) : (
                  "Connect Number"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
