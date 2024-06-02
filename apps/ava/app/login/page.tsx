import LoginForm from '@/components/login-form'
import { auth } from '@/auth'
import { Session } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }
  return (
    <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
      <div className="flex items-center justify-center container mt-5 sm:w-[450px] mx-auto">
        <LoginForm />
      </div>
    </div>
  )
}
