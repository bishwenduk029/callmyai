"use client"

import { useState } from "react"
import { purchasePhoneNumber, releasePhoneNumber } from "@/actions/phone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { User } from "@/db/schema/index"

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Icons } from "../icons"

const formSchema = z.object({
  region: z.string().min(2).max(2),
  phoneNumber: z.string().optional(),
})

interface PhoneNumberFormProps {
  user: User & {
    phoneNumber?: string | null
  }
}

const regions = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "IN", label: "India" },
  // Add more regions as needed
]

export function PhoneNumberForm({ user }: PhoneNumberFormProps) {
  console.log(user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [availableNumbers, setAvailableNumbers] = useState<
    Array<{ number: string }>
  >([])
  const [selectedNumber, setSelectedNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
      phoneNumber: user.phone || undefined,
    },
  })

  const { execute: executePurchase, status } = useAction(purchasePhoneNumber, {
    onSuccess: (data) => {
      if (data.data?.success) {
        toast({
          title: "Success",
          description: data.data.message,
        })
        setIsModalOpen(false)
        form.reset()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.data?.error,
        })
      }
    },
  })

  const { execute: executeRelease, status: releaseStatus } = useAction(
    releasePhoneNumber,
    {
      onSuccess: (data) => {
        if (data.data?.success) {
          toast({
            title: "Success",
            description: data.data.message,
          })
          form.reset()
        } else {
          console.log(data?.data?.error)
          toast({
            variant: "destructive",
            title: "Error",
            description: data?.data?.error?.message,
          })
        }
      },
    }
  )

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!selectedNumber) return
    executePurchase({ phoneNumber: selectedNumber, userId: user.id })
  }

  const handleSearch = async (region: string) => {
    try {
      setIsSearching(true)
      const response = await fetch(
        `/api/phone-numbers/available?region=${region}`
      )
      const data = await response.json()
      setAvailableNumbers(data.data)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error fetching phone numbers:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleNumberSelection = (number: string) => {
    setSelectedNumber(number)
    setIsModalOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Phone Number</CardTitle>
        <CardDescription>
          Purchase a phone number for your AI Call Handle to receive incoming
          calls.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {user.phone ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    Purchased Number:
                  </p>
                  <p className="text-lg font-medium">{user.phone}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => executeRelease({ userId: user.id })}
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
              </div>
            ) : (
              <>
                <FormLabel className="text-md font-medium">Region</FormLabel>
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleSearch(value)
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region">
                            {field.value &&
                              regions.find((r) => r.value === field.value)
                                ?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedNumber && (
                  <div className="mt-4 rounded-lg border bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Selected Number:
                    </p>
                    <p className="text-lg font-medium">{selectedNumber}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            {!user.phone && (
              <Button
                type="submit"
                disabled={
                  !selectedNumber || status === "executing" || isSearching
                }
              >
                {status === "executing" ? (
                  <>
                    <Icons.spinner
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Purchasing...
                  </>
                ) : isSearching ? (
                  <>
                    <Icons.spinner
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Loading numbers...
                  </>
                ) : (
                  "Purchase Number"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Available Phone Numbers</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {availableNumbers.slice(0, 6).map((num) => (
              <Button
                key={num.number}
                variant={selectedNumber === num.number ? "default" : "outline"}
                onClick={() => handleNumberSelection(num.number)}
              >
                {num.number}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
