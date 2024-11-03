export interface AppError {
  code: string
  message: string
}

interface CreateAppErrorParams {
  code: string
  message: string
}

export function createAppError({ code, message }: CreateAppErrorParams): AppError {
  return { code, message }
} 