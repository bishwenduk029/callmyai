'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/login/actions'
import Link from 'next/link'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { IconGoogle, IconSpinner } from './ui/icons'
import { getMessageFromCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Input } from './ui/input'
import { Label } from './ui/label'

export default function LoginForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(authenticate, undefined)

  useEffect(() => {
    console.log("back in effect", result)
    if (result) {
      if (result.type === 'error') {
        toast.error(getMessageFromCode(result.resultCode))
      } else {
        console.log(result)
        toast.success(getMessageFromCode(result.resultCode))
      }
    }
  }, [result, router])

  return (
    <form
      action={dispatch}
      className="flex flex-col item-stretch gap-4 space-y-3 w-full"
    >
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-balance text-muted-foreground">to SuperMemory</p>
      </div>
      <div className="grid gap-4">
        <LoginButton />
      </div>
    </form>
  )
}

export function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-md bg-foreground p-2 text-sm font-semibold text-background hover:bg-zinc-800"
      aria-disabled={pending}
    >
      {pending ? (
        <IconSpinner />
      ) : (
        <span className="flex flex-row justify-center align-middle">
          <IconGoogle />
          <span className="ml-3 text-lg">Continue with Google</span>
        </span>
      )}
    </button>
  )
}
