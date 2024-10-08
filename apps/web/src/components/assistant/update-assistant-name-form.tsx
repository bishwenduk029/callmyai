"use client"
import { RtviConfig, updateAssistant } from "@/actions/assistant"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Assistant } from "../../db/schema/index"
import { Input } from "../ui/input"
import { SubmitButton } from "../ui/submit-button"

interface UpdateAssistantNameFormProps {
  assistant: Assistant
  config: RtviConfig
}

const assistantConfigSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Your name must be at least 2 characters long." }),
  description: z.string().optional(),
  header: z.string().optional(),
  config: z.any(),
})

export function UpdateAssistantDisplayDetails({
  assistant,
  config,
}: UpdateAssistantNameFormProps) {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(assistantConfigSchema),
    defaultValues: {
      name: assistant.name,
      description: config?.description,
      header: config?.header,
    },
  })

  const updateAssistantAction = useAction(updateAssistant, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error updating assistant name",
          description: result?.data?.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Assistant Name Updated",
          description: result?.data?.error,
        })
        const assistantUpdatedEvent = new Event('assistantUpdated')
        window.dispatchEvent(assistantUpdatedEvent)
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error updating assistant name",
        description:
          "We encountered some error when updating your assistant name.",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof assistantConfigSchema>) => {
    updateAssistantAction.execute({
      id: assistant.id,
      name: values.name,
      duration: assistant.duration,
      // @ts-ignore
      config: {
        ...config,
        header: values.header,
        description: values.description,
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Assistant Display Details</CardTitle>
          <CardDescription>Update details as needed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm my-1 block font-semibold text-gray-700"
              >
                Name
              </label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your preferred name"
                className="w-full px-2 py-3"
                defaultValue={assistant.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="botDescription"
                className="text-sm my-1 block font-semibold text-gray-700"
              >
                Description
              </label>
              <Input
                id="botDescription"
                {...form.register("description")}
                placeholder="Enter a description for your assistant"
                className="w-full px-2 py-3"
                defaultValue={config?.description}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="header"
                className="text-sm my-1 block font-semibold text-gray-700"
              >
                Header
              </label>
              <Input
                id="header"
                {...form.register("header")}
                placeholder="Enter a header for your assistant"
                className="w-full px-2 py-3"
                defaultValue={config?.header}
              />
              {form.formState.errors.header && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.header.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton
            isDisabled={false}
            isSubmitting={updateAssistantAction.isExecuting}
          >
            Save Configuration
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
