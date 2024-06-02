'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/app/signup/actions'
import Link from 'next/link'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { IconSpinner } from './ui/icons'
import { getMessageFromCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LoginButton } from './login-form';
import { authenticate } from '@/app/login/actions'

export default function SignupForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(authenticate, undefined)

  useEffect(() => {
    if (result) {
      if (result.type === 'error') {
        toast.error(getMessageFromCode(result.resultCode))
      } else {
        toast.success(getMessageFromCode(result.resultCode))
        router.refresh()
      }
    }
  }, [result, router])

  return (
    <form
      action={dispatch}
      className="flex flex-col items-center gap-4 space-y-3"
    >
      <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md md:w-96">
        <h1 className="mb-3 text-2xl text-foreground font-bold">
          Create a new Account!
        </h1>
        <div className="grid gap-4">
          <LoginButton />
        </div>
      </div>
    </form>
  )
}
