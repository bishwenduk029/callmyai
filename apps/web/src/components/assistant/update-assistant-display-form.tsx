"use client"

import { RtviConfig, updateAssistant } from "@/actions/assistant"
import { zodResolver } from "@hookform/resolvers/zod"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"
import { falClient } from "@/lib/fal"
import { voices } from "@/lib/voices"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useState } from "react"
import { Assistant } from "../../db/schema/index"
import { Icons } from "../icons"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
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
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  avatar: z.string().optional(),
  voice: z.string().optional(),
})

interface FalResult {
  images?: { url: string }[]
}

export function UpdateAssistantDisplayDetails({
  assistant,
  config,
}: UpdateAssistantNameFormProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm({
    resolver: zodResolver(assistantConfigSchema),
    defaultValues: {
      name: assistant.name,
      description: config?.description,
      header: config?.header,
      gender: config?.gender,
      ethnicity: config?.ethnicity,
      avatar: config?.avatar,
      voice: config?.tts?.voice,
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
          title: "Assistant Display Details Updated",
          description: result?.data?.error,
        })
        const assistantUpdatedEvent = new Event("assistantUpdated")
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
    const selectedVoice = voices.find(v => v.id === values.voice)
    console.group(values)
    
    updateAssistantAction.execute({
      id: assistant.id,
      name: values.name,
      duration: assistant.duration,
      config: {
        ...config,
        header: values.header,
        description: values.description,
        gender: selectedVoice?.gender!,
        ethnicity: values.ethnicity,
        avatar: values.avatar,
        tts: {
          ...config?.tts,
          provider: selectedVoice?.provider || "openai",
          voice: values.voice!
        },
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
                className="my-1 block text-sm font-semibold text-gray-700"
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
                className="my-1 block text-sm font-semibold text-gray-700"
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
                className="my-1 block text-sm font-semibold text-gray-700"
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
            <div className="flex flex-col gap-6 justify-between align-baseline sm:flex-row">
              <Avatar className="h-48 w-48 flex-shrink-0">
                <AvatarImage
                  src={form.getValues("avatar") || config?.avatar}
                  alt="@assistant"
                />
                <AvatarFallback>BOT</AvatarFallback>
              </Avatar>
              <div className="space-y-6 flex-1">
                <div className="w-full">
                  <label
                    htmlFor="ethnicity"
                    className="my-1 block text-sm font-semibold text-gray-700"
                  >
                    Ethnicity
                  </label>
                  <Select
                    {...form.register("ethnicity")}
                    defaultValue={config?.ethnicity}
                    onValueChange={(value) => {
                      form.setValue("ethnicity", value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Caucasian">Caucasian</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="African">African</SelectItem>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Hispanic">Hispanic</SelectItem>
                      <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                      <SelectItem value="South Asian">South Asian</SelectItem>
                      <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.ethnicity && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.ethnicity.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="voice"
                    className="my-1 block text-sm font-semibold text-gray-700"
                  >
                    Voice
                  </label>
                  <Select
                    {...form.register("voice")}
                    defaultValue={voices.find(v => v.id === config?.tts?.voice)?.id}
                    onValueChange={(value) => {
                      form.setValue("voice", value)
                      const selectedVoice = voices.find(v => v.id === value)
                      if (selectedVoice?.gender)
                        form.setValue("gender", selectedVoice.gender)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} - {voice.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.voice && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.voice.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  disabled={isGenerating}
                  onClick={async () => {
                    const gender = form.getValues("gender")
                    const ethnicity = form.getValues("ethnicity")

                    if (gender && ethnicity) {
                      try {
                        setIsGenerating(true)
                        const prompt = `A passport photo of a charismatic sales agent with gender ${gender} and of ${ethnicity} ethnicity. The agent has long, slightly wavy blonde hair tied back in a ponytail. The face is expressive and confident. The agent is wearing a dark, textured shirt with unique, slightly shimmering patterns. The background is a calm, bright sunny color in a slightly darker shade—something like a muted dark yellow (but not black). The photo is passport-sized.`
                        const result = await falClient.subscribe(
                          "fal-ai/flux/schnell",
                          {
                            input: {
                              prompt,
                              num_images: 1,
                              num_inference_steps: 4,
                              enable_safety_checker: true,
                              image_size: {
                                width: 48,
                                height: 48,
                              },
                            },
                            pollInterval: 5000,
                            logs: false,
                            onQueueUpdate(update) {
                              // console.log("Queue update", update)
                            },
                          }
                        )

                        const typedResult = result as FalResult

                        if (
                          !typedResult ||
                          Object.keys(typedResult).length === 0 ||
                          !typedResult.images ||
                          typedResult.images.length === 0
                        ) {
                          throw new Error("No result from fal")
                        }

                        // @ts-ignore
                        const imageUrl = typedResult.images[0].url

                        // Update the form with the generated image URL
                        form.setValue("avatar", imageUrl)

                        toast({
                          title: "Image Generated",
                          description:
                            "The avatar image has been generated successfully.",
                          variant: "default",
                        })
                        setIsGenerating(false)
                      } catch (error) {
                        console.error("Error generating image:", error)
                        toast({
                          title: "Error",
                          description:
                            "Failed to generate the image. Please try again.",
                          variant: "destructive",
                        })
                        setIsGenerating(false)
                      }
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select both gender and ethnicity.",
                        variant: "destructive",
                      })
                      setIsGenerating(false)
                    }
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Icons.spinner
                        className="mr-2 size-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span className="mr-2">Try Another Avatar</span>
                  )}
                </Button>
              </div>
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
