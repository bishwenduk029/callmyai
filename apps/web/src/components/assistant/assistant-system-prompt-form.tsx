"use client"

import { useCallback, useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { RtviConfig, updateAssistantConfig } from "@/actions/assistant"
import {
  AppAction,
  fetchAppActions,
  fetchExternalAppsAction,
  getIntegrationsByUserId,
  updateIntegration,
} from "@/actions/integration"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { Control } from "react-hook-form"

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
import { FancyArea } from "../fancy-area"
import { SubmitButton } from "../ui/submit-button"
import { Textarea } from "../ui/textarea"

interface AssistantSystemPromptFormProps {
  assistant: Assistant
  config: RtviConfig
  userId: string
}

const systemPromptSchema = z.object({
  systemPrompt: z
    .string()
    .min(10, { message: "System prompt must be at least 10 characters long." }),
  tools: z.array(z.string().optional()),
})

interface FormValues {
  systemPrompt: string
  tools: (string | undefined)[]
}

export function AssistantSystemPromptForm({
  assistant,
  config,
  userId,
}: AssistantSystemPromptFormProps) {
  const { toast } = useToast()
  const [hasFetchedIntegrations, setHasFetchedIntegrations] = useState(false)
  const [newActions, setNewActions] = useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(systemPromptSchema),
    defaultValues: {
      systemPrompt: config?.llm?.messages[0]?.content || "",
      tools: config?.tools || [],
    },
  })

  const updateConfigAction = useAction(updateAssistantConfig, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error updating system prompt",
          description: result?.data?.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "System Prompt Updated",
          description: "The system prompt has been updated successfully.",
        })
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error updating system prompt",
        description:
          "We encountered some error when updating the system prompt.",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof systemPromptSchema>) => {
    const updatedConfig = {
      ...config,
      llm: {
        // @ts-ignore
        ...config!.llm,
        messages: [
          {
            role: "system",
            content: values.systemPrompt,
          },
        ],
      },
      tts: {
        // @ts-ignore
        ...config!.tts,
        provider: "elevenlabs",
        voice: "default",
        metadata: { voice: "default" },
      },
      tools: [...new Set([...values.tools, ...newActions])],
    }

    updateConfigAction.execute({
      assistantId: assistant.id,
      config: updatedConfig,
    })
  }

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

  const handleNewActionSelected = useCallback((action: string) => {
    setNewActions(prevActions => {
      if (!prevActions.includes(action)) {
        return [...prevActions, action]
      }
      return prevActions
    })
  }, [])

  useEffect(() => {
    handleFetchIntegrations()
  }, [userId])

  const integrations = availableIntegrations?.data?.data ?? []

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            Enter the system prompt for your assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FancyArea
                {...field}
                placeholder="Enter the system prompt"
                className="mb-4 w-full px-2 py-3"
                integrations={integrations}
                onNewActionSelected={handleNewActionSelected}
                id="systemPrompt"
              />
            )}
          />
          {form.formState.errors.systemPrompt && (
            <p className="text-sm text-destructive">
              {form.formState.errors.systemPrompt.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton
            isDisabled={false}
            isSubmitting={updateConfigAction.isExecuting}
          >
            Save Prompt
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
