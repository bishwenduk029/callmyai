import { updateUserByUsername } from "@/actions/user"
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

import { User } from "../../db/schema/index"
import { Input } from "../ui/input"
import { SubmitButton } from "../ui/submit-button"

interface UserNameFormProps {
  user: User
}

const usernameSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Your name must be at least 4 characters long." }),
})

export default function UserNameForm({ user }: UserNameFormProps) {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: { name: user.name || "" },
  })

  const updateUser = useAction(updateUserByUsername, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error updating your name",
          description: result?.data?.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Call Handle Updated",
          description: result?.data?.message,
        })
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error updating your name",
        description: "We encountered some error when updating your name.",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof usernameSchema>) => {
    updateUser.execute({
      id: user.id,
      name: values.name,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full" {...form}>
      <Card>
        <CardHeader>
          <CardTitle>Your Name</CardTitle>
          <CardDescription>
            Enter the name you want your AI call assistant to use when referring
            to you in calls.
          </CardDescription>
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
            isSubmitting={updateUser.isExecuting}
          >
            Save Name
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
