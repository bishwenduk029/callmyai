import { cn } from "@/lib/utils"

import { Icons } from "../icons"
import { Button, ButtonProps } from "./button"

export function SubmitButton({
  children,
  isSubmitting,
  isDisabled = false,
  ...props
}: {
  children: React.ReactNode
  isSubmitting: boolean
  isDisabled?: boolean
} & ButtonProps) {
  return (
    <Button disabled={isSubmitting || isDisabled} {...props} type="submit">
      {isSubmitting ? (
        <>
          <Icons.spinner
            className="mr-2 size-4 animate-spin"
            aria-hidden="true"
          />
          <span>Saving...</span>
        </>
      ) : (
        <span className="mr-2">{children}</span>
      )}
    </Button>
  )
}

export const LoadingSpinner = ({
  className,
  size,
}: {
  className: string
  size: number
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)
