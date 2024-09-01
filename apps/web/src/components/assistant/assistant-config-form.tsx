import { updateAssistant } from "@/actions/assistant"
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

interface AssistantNameFormProps {
  assistant: Assistant
}

const assistantNameSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Your name must be at least 4 characters long." }),
})

export default function AssistantNameForm({
  assistant,
}: AssistantNameFormProps) {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(assistantNameSchema),
    defaultValues: { name: assistant.name || "" },
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

  const onSubmit = async (values: z.infer<typeof assistantNameSchema>) => {
    updateAssistantAction.execute({
      id: assistant.id,
      name: values.name,
      duration: assistant.duration,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full" {...form}>
      <Card>
        <CardHeader>
          <CardTitle>Assistant Name</CardTitle>
          <CardDescription>Enter the name of your assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter your preferred name"
            className="mb-4 w-full px-2 py-3"
          />
          {form.formState.errors && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name?.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton
            isDisabled={false}
            isSubmitting={updateAssistantAction.isExecuting}
          >
            Save Name
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
