'use server'

import { signIn } from '@/auth'
import { ResultCode } from '@/lib/utils'
import { AuthError } from 'next-auth'

interface Result {
  type: string
  resultCode: ResultCode
}

export async function signup(
  _prevState: Result | undefined,
  formData: FormData | undefined
): Promise<Result | undefined> {
  try {
    await signIn('google')

    return
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'OAuthSignInError':
          return {
            type: 'error',
            resultCode: ResultCode.InvalidCredentials
          }
        default:
          return {
            type: 'error',
            resultCode: ResultCode.UnknownError
          }
      }
    } else {
      return {
        type: 'error',
        resultCode: ResultCode.UnknownError
      }
    }
  }
}
