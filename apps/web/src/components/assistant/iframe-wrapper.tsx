'use client'

import { forwardRef, IframeHTMLAttributes } from "react"

export const IframeWrapper = forwardRef<
  HTMLIFrameElement,
  IframeHTMLAttributes<HTMLIFrameElement>
>((props, ref) => {
  return <iframe ref={ref} {...props} />
})

IframeWrapper.displayName = "IframeWrapper"
