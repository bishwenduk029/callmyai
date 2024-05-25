'use client'
import React from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform
} from 'framer-motion'
import { useRef } from 'react'
import { cn } from "@/lib/utils";
import { Button } from './ui/button';

export function FancyButton({
  borderRadius = '1.75rem',
  children,
  as: Component = 'button',
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string
  children: React.ReactNode
  as?: any
  containerClassName?: string
  borderClassName?: string
  duration?: number
  className?: string
  [key: string]: any
}) {
  return (
    <Button
      className={cn(
        'bg-transparent relative text-xl p-px overflow-hidden ',
        containerClassName
      )}
      style={{
        borderRadius: borderRadius
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="50%" ry="50%">
          <div
            className={cn(
              'size-20 opacity-80 bg-[radial-gradient(var(--sky-500)_40%,transparent_60%)]',
              borderClassName
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          'relative bg-white border border-slate-800 backdrop-blur-xl text-black flex items-center justify-center size-full text-sm antialiased',
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`
        }}
      >
        {children}
      </div>
    </Button>
  )
}

export const MovingBorder = ({
  children,
  duration = 2000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode
  duration?: number
  rx?: string
  ry?: string
  [key: string]: any
}) => {
  const pathRef = useRef<any>()
  const progress = useMotionValue<number>(0)

  useAnimationFrame(time => {
    const length = pathRef.current?.getTotalLength()
    if (length) {
      const pxPerMillisecond = length / duration
      progress.set((time * pxPerMillisecond) % length)
    }
  })

  const x = useTransform(
    progress,
    val => pathRef.current?.getPointAtLength(val).x
  )
  const y = useTransform(
    progress,
    val => pathRef.current?.getPointAtLength(val).y
  )

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute size-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'inline-block',
          transform
        }}
      >
        {children}
      </motion.div>
    </>
  )
}
