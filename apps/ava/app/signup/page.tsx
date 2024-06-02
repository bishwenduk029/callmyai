import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoginForm from '@/components/login-form'
import { auth } from '@/auth'
import { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import SignupForm from '@/components/signup-form'

export default async function LoginPage() {
  const session = (await auth()) as Session
  console.log(session)

  if (session) {
    redirect('/')
  }
  return (
    <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
      <div className="flex items-center justify-center w-[450px] mx-auto">
        <SignupForm />
      </div>
    </div>
  )
}
