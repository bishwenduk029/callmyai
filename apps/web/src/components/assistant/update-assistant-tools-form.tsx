"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { RtviConfig, updateAssistant } from "@/actions/assistant"
import { getIntegrationsByUserId } from "@/actions/integration"
import { getUserByEmail } from "@/actions/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"
import auth from "@/lib/auth"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Assistant, Integration } from "../../db/schema/index"
import { FancyMultiSelect } from "../fancy-multi-select"
import { Button } from "../ui/button"
import { SubmitButton } from "../ui/submit-button"

interface UpdateAssistantToolsFormProps {
  assistant: Assistant
  config: RtviConfig
  userId?: string
}

const assistantToolsSchema = z.object({
  tools: z.array(z.string()).optional(),
})

export function UpdateAssistantToolsForm({
  assistant,
  config,
  userId,
}: UpdateAssistantToolsFormProps) {
  const { toast } = useToast()

  const [hasFetchedIntegrations, setHasFetchedIntegrations] = useState(false)

  const form = useForm({
    resolver: zodResolver(assistantToolsSchema),
    defaultValues: {
      tools: config?.tools,
    },
  })

  const updateAssistantAction = useAction(updateAssistant, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error updating assistant tools",
          description: result?.data?.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Assistant Tools Updated",
          description: "The assistant's tools have been successfully updated.",
        })
        const assistantUpdatedEvent = new Event("assistantUpdated")
        window.dispatchEvent(assistantUpdatedEvent)
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error updating assistant tools",
        description:
          "We encountered an error when updating your assistant tools.",
        variant: "destructive",
      })
    },
  })

  const {
    execute: fetchIntegrations,
    isExecuting: isFetchingIntegrations,
    result: availableIntegrations,
  } = useAction(getIntegrationsByUserId)

  const handleFetchIntegrations = () => {
    if (!hasFetchedIntegrations) {
      fetchIntegrations({ userId })
      setHasFetchedIntegrations(true)
    }
  }

  const onSubmit = async (values: z.infer<typeof assistantToolsSchema>) => {
    updateAssistantAction.execute({
      id: assistant.id,
      name: assistant.name,
      duration: assistant.duration,
      config: {
        ...config,
        tools: values.tools,
      },
    })
  }

  const integrations = availableIntegrations?.data?.data ?? []

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Apps Assistant Can Access</CardTitle>
          <CardDescription>
            Add Apps as needed to allow the assistant to access them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="tools"
                className="my-1 block text-sm font-semibold text-gray-700"
              >
                Tools
              </label>
              <Controller
                name="tools"
                control={form.control}
                render={({ field }) => (
                  <FancyMultiSelect
                    {...field}
                    placeholder="Select Tools..."
                    fetchingOptions={isFetchingIntegrations}
                    defaultSelected={config?.tools?.map((tool) => {
                      const parsedTool: Integration = JSON.parse(tool)
                      return {
                        value: tool,
                        label: parsedTool.connectedAccountName,
                        logo: parsedTool.logo || "",
                      }
                    })}
                    options={integrations?.map((integration: Integration) => ({
                      value: JSON.stringify(integration),
                      label: integration.connectedAccountName,
                      logo: integration.logo,
                    }))}
                    onSelect={(selectedTool) => {
                      const updatedTools = field.value
                        ? [...field.value, selectedTool.value]
                        : [selectedTool.value]
                      field.onChange(updatedTools)
                    }}
                    handleOnClick={handleFetchIntegrations}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton
            isDisabled={isFetchingIntegrations}
            isSubmitting={updateAssistantAction.isExecuting}
          >
            Save Tools
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
