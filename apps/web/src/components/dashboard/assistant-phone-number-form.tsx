"use client"

import { useTransition } from "react"
import {
  releaseAssistantPhoneNumber,
  updateAssistantPhoneNumber,
} from "@/actions/phone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "../icons"

const formSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  assistantId: z.string(),
})

interface AssistantPhoneNumberFormProps {
  assistantId: string
  currentPhoneNumber: string
}

export function AssistantPhoneNumberForm({
  assistantId,
  currentPhoneNumber,
}: AssistantPhoneNumberFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: currentPhoneNumber,
      assistantId,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateAssistantPhoneNumber(values)

      if (!result?.data?.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            result?.data?.error?.message || "Failed to update phone number",
        })
        return
      }

      toast({
        title: "Success",
        description: result?.data?.message,
      })
    })
  }

  function handleRelease() {
    startTransition(async () => {
      const result = await releaseAssistantPhoneNumber({ assistantId })

      if (!result?.data?.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            result?.data?.error?.message || "Failed to release phone number",
        })
        return
      }

      toast({
        title: "Success",
        description: result?.data?.message,
      })
      form.reset({ phoneNumber: "" })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistant Phone Number</CardTitle>
        <CardDescription>
          Configure the phone number for this AI assistant to receive calls.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assistant Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your Twilio Virtual Phone Number in E.164 format (e.g.,
                    +1234567890)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Updating...
                </>
              ) : (
                "Update Number"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRelease}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Icons.spinner
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Releasing...
                </>
              ) : (
                "Release Number"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
