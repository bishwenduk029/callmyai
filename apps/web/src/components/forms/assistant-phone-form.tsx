'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { updateAssistantPhoneNumber } from '@/actions/phone';

const formSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
})

interface AssistantPhoneFormProps {
  assistantId: string
  initialPhoneNumber?: string
}

export function AssistantPhoneForm({ assistantId, initialPhoneNumber }: AssistantPhoneFormProps) {
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updateAssistantPhoneNumber({
      assistantId,
      phoneNumber: values.phoneNumber,
    })

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update Phone Number</Button>
      </form>
    </Form>
  )
} 