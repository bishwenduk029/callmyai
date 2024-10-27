"use client"

import { useState } from "react"
import { RtviConfig, updateAssistantConfig } from "@/actions/assistant"
import { fetchDataSources } from "@/actions/data-sources"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Assistant } from "@/db/schema/index"

import { useToast } from "@/hooks/use-toast"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SubmitButton } from "@/components/ui/submit-button"
import { FancyMultiSelect } from "@/components/fancy-multi-select"

const formSchema = z.object({
  dataSources: z.array(z.object({
    fileId: z.number(),
    sourceType: z.string(),
    fileName: z.string(),
  })),
})

type FormValues = z.infer<typeof formSchema>

interface UpdateAssistantDataSourcesFormProps {
  assistant: Assistant
  config: RtviConfig
  userEmail: string
}

export function UpdateAssistantDataSourcesForm({
  assistant,
  config,
  userEmail,
}: UpdateAssistantDataSourcesFormProps) {
  const { toast } = useToast()
  const [hasFetchedDataSources, setHasFetchedDataSources] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataSources: config?.dataSources || [],
    },
  })

  const { execute: executeUpdate, isExecuting: isUpdatingDataSources } =
    useAction(updateAssistantConfig, {
      onSuccess: (result) => {
        if (result?.data?.error) {
          toast({
            title: "Error updating data sources",
            description: result.data.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Data Sources Updated",
            description: "The data sources have been successfully updated.",
          })
        }
      },
      onError: (error) => {
        console.error("Update error:", error)
        toast({
          title: "Error updating data sources",
          description:
            "An unexpected error occurred while updating the data sources.",
          variant: "destructive",
        })
      },
    })

  const {
    execute: fetchDataSourcesAction,
    result: dataSources,
    isExecuting: isFetchingDataSources,
  } = useAction(fetchDataSources, {
    onError: (error) => {
      console.error("Failed to fetch data sources:", error)
      toast({
        title: "Error fetching data sources",
        description: "Failed to load data sources. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleFetchDataSources = () => {
    if (!hasFetchedDataSources) {
      fetchDataSourcesAction({ customerId: userEmail })
      setHasFetchedDataSources(true)
    }
  }

  const dataSourceOptions =
    dataSources.data?.data.map(
      (source: { fileId: string; fileName: string; sourceType: string }) => ({
        value: source.fileId,
        label: `${source.sourceType} - ${source.fileName}`,
        logo: null,
      })
    ) || []

  async function onSubmit(data: FormValues) {
    const updatedConfig: RtviConfig = {
      ...config,
      dataSources: data.dataSources,
      llm: config?.llm || { model: { provider: "", name: "" }, messages: [] },
      tts: config?.tts || { provider: "", voice: "" },
    }

    try {
      const result = executeUpdate({
        assistantId: assistant.id,
        config: updatedConfig,
      })
    } catch (error) {
      console.error("executeUpdate error:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <div>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Manage data sources for your assistant
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Data Sources:</h4>
            <Controller
              name="dataSources"
              control={control}
              render={({ field }) => (
                <FancyMultiSelect
                  options={dataSourceOptions}
                  defaultSelected={field.value.map(val => ({
                    value: val.fileId.toString(),
                    label: `${val.sourceType} - ${val.fileName}`,
                    logo: null,
                  }))}
                  placeholder="Select data sources..."
                  handleOnClick={handleFetchDataSources}
                  fetchingOptions={isFetchingDataSources}
                  onSelect={(option) => {
                    const isSelected = dataSourceOptions.some(
                      (ds: { value: number }) => ds.value === Number(option.value)
                    )
                    
                    const newValue = isSelected
                      ? field.value.filter(val => val.fileId !== Number(option.value))
                      : [...field.value, {
                          fileId: Number(option.value),
                          sourceType: option.label?.split(" - ")[0] || "",
                          fileName: option.label?.split(" - ")[1] || "",
                        }]
                    
                    field.onChange(newValue)
                  }}
                />
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton
            isSubmitting={isUpdatingDataSources}
            isDisabled={isFetchingDataSources || isUpdatingDataSources}
          >
            Update Data Sources
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
