"use client"

import {
  releaseAssistantPhoneNumber,
  updateAssistantPhoneNumber,
} from "@/actions/phone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
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
import { SubmitButton } from "../ui/submit-button"

const formSchema = z.object({
  phoneNumber: z.string().min(10).max(15).nullable().optional(),
  assistantId: z.string(),
})

interface AssistantPhoneNumberFormProps {
  assistantId: string
  currentPhoneNumber: string | null | undefined
}

export function AssistantPhoneNumberForm({
  assistantId,
  currentPhoneNumber,
}: AssistantPhoneNumberFormProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: currentPhoneNumber,
      assistantId,
    },
  })

  const { execute: executeUpdate, status: updateStatus } = useAction(
    updateAssistantPhoneNumber,
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
            description:
              data.data?.error?.message || "Failed to update phone number",
          })
        }
      },
    }
  )

  const { execute: executeRelease, status: releaseStatus } = useAction(
    releaseAssistantPhoneNumber,
    {
      onSuccess: (data) => {
        if (data.data?.success) {
          toast({
            title: "Success",
            description: data.data.message,
          })
          form.reset({ phoneNumber: "", assistantId })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              data.data?.error?.message || "Failed to release phone number",
          })
        }
      },
    }
  )

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await executeUpdate({
        phoneNumber: values.phoneNumber || "",
        assistantId: assistantId, // Use the prop directly instead of form value
      })
    } catch (error) {
      console.error("Error updating phone number:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update phone number",
      })
    }
  }

  const handleRelease = (event: any) => {
    event?.preventDefault()
    executeRelease({ assistantId })
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assistant Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1234567890"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your Twilio Virtual Phone Number in E.164 format
                    (e.g., +1234567890)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" name="assistantId" value={assistantId} />
          </CardContent>
          <CardFooter className="flex gap-2">
            {!currentPhoneNumber && (
              <Button type="submit" disabled={updateStatus === "executing"}>
                {updateStatus === "executing" ? (
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
            )}
            {currentPhoneNumber && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRelease}
                disabled={releaseStatus === "executing"}
              >
                {releaseStatus === "executing" ? (
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
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
