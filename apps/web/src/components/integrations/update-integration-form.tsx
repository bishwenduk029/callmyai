"use client"

import { useState } from "react"
import {
  AppAction,
  fetchAppActionsAction,
  updateIntegration,
} from "@/actions/integration"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { Controller, useForm } from "react-hook-form"
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

import { FancyMultiSelect } from "../fancy-multi-select"
import { SubmitButton } from "../ui/submit-button"
import Image from "next/image"

interface UpdateIntegrationActionsProps {
  integrationId: string
  appName: string
  currentActions: string[] | null
  description: string | null
  logo: string | null
  key: string
}

const updateIntegrationActionsSchema = z.object({
  integrationId: z.string(),
  appName: z.string(),
  currentActions: z.array(z.string()).default([]).optional().nullable(),
})

export default function UpdateIntegrationForm({
  integrationId,
  appName,
  description,
  logo,
  currentActions,
}: UpdateIntegrationActionsProps) {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(updateIntegrationActionsSchema),
    defaultValues: {
      integrationId: integrationId,
      appName: appName,
      currentActions: currentActions,
    },
  })

  const {
    execute: executeUpdate,
    status: updateStatus,
    isExecuting: isUpdatingIntegrationActions,
  } = useAction(updateIntegration, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error updating integration actions",
          description: result.data.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: `Integration Actions for ${appName} Updated`,
          description:
            `The integration actions for ${appName} have been successfully updated.`,
        })
      }
    },
    onError: (error) => {
      console.error(error)
      toast({
        title: "Error updating integration actions",
        description:
          "An unexpected error occurred while updating the integration actions.",
        variant: "destructive",
      })
    },
  })

  const {
    execute: fetchAllActions,
    status: fetchStatus,
    result: appActionsInUse,
    isExecuting: isFetchingAppActions,
  } = useAction(fetchAppActionsAction)

  const [hasFetchedActions, setHasFetchedActions] = useState(false)

  const handleFetchActions = () => {
    if (!hasFetchedActions) {
      fetchAllActions({ appName })
      setHasFetchedActions(true)
    }
  }

  const onSubmit = async (
    values: z.infer<typeof updateIntegrationActionsSchema>
  ) => {
    executeUpdate({
      integrationId: values.integrationId,
      availableActions: values.currentActions,
    })
  }

  const actionsInUse = appActionsInUse?.data?.data.items ?? []

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Card key={integrationId} className="border-l-8" style={{ borderLeftColor: `hsl(${Math.random() * 360}, 100%, 85%)` }}>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Image
            src={logo || ""}
            alt={`${appName} logo`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <CardTitle>{appName}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Actions:</h4>

            <Controller
              name="currentActions"
              control={form.control}
              render={({ field }) => (
                <FancyMultiSelect
                  {...field}
                  placeholder="Select More Actions..."
                  fetchingOptions={isFetchingAppActions}
                  defaultSelected={currentActions?.map((action) => ({
                    value: action,
                    label: action,
                  }))}
                  options={actionsInUse.map((action: AppAction) => ({
                    value: action.name,
                    label: action.displayName || action.name,
                  }))}
                  handleOnClick={handleFetchActions}
                  onSelect={(selectedAction) => {
                    const updatedActions = field.value
                      ? [...field.value, selectedAction.value]
                      : [selectedAction.value]
                    field.onChange(updatedActions)
                  }}
                />
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton
            variant="outline"
            size="sm"
            isSubmitting={isUpdatingIntegrationActions}
            isDisabled={isFetchingAppActions || isUpdatingIntegrationActions}
          >
            Update
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
