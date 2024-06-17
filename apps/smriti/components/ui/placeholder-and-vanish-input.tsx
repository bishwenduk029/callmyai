'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from './textarea'

export function PlaceholdersAndVanishInput({
  placeholders,
  onKeyDown,
  onChange
}: {
  placeholders: string[]
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const newDataRef = useRef<any[]>([])
  const [value, setValue] = useState('')
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const startAnimation = () => {
      const interval = setInterval(() => {
        setCurrentPlaceholder(prev => (prev + 1) % placeholders.length)
      }, 2000)
      return () => clearInterval(interval)
    }

    startAnimation()
  }, [placeholders.length])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const draw = useCallback(() => {
    if (!inputRef) return
    if (!inputRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 800
    ctx.clearRect(0, 0, 800, 800)
    const computedStyles = getComputedStyle(inputRef.current)

    const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'))
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`
    ctx.fillStyle = '#FFF'
    ctx.fillText(value, 16, 40)

    const imageData = ctx.getImageData(0, 0, 800, 800)
    const pixelData = imageData.data
    const newData: any[] = []

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3]
            ]
          })
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
    }))
  }, [value])

  useEffect(() => {
    draw()
  }, [value, draw])

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = []
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i]
          if (current.x < pos) {
            newArr.push(current)
          } else {
            if (current.r <= 0) {
              current.r = 0
              continue
            }
            current.x += Math.random() > 0.5 ? 1 : -1
            current.y += Math.random() > 0.5 ? 1 : -1
            current.r -= 0.05 * Math.random()
            newArr.push(current)
          }
        }
        newDataRef.current = newArr
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800)
          newDataRef.current.forEach(t => {
            const { x: n, y: i, r: s, color: color } = t
            if (n > pos) {
              ctx.beginPath()
              ctx.rect(n, i, s, s)
              ctx.fillStyle = color
              ctx.strokeStyle = color
              ctx.stroke()
            }
          })
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8)
        } else {
          setValue('')
          setAnimating(false)
        }
      })
    }
    animateFrame(start)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !animating) {
      vanishAndSubmit()
    }
    setAnimating(false)
    onKeyDown(e)
  }

  const vanishAndSubmit = () => {
    setAnimating(true)
    draw()

    const value = inputRef.current?.value || ''
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      )
      animate(maxX)
    }
  }

  return (
    <div className='w-full'>
      <canvas
        className={cn(
          'absolute pointer-events-none border-0  text-base scale-50 top-[20%] left-2 sm:left-4 origin-top-left invert dark:invert-0 pr-20',
          !animating ? 'opacity-0' : 'opacity-100'
        )}
        ref={canvasRef}
      />

      <Textarea
        tabIndex={0}
        ref={inputRef}
        className="min-h-[60px] border-0 w-full text-foreground text-2xl resize-none bg-transparent px-2 py-[1.3rem] focus:ring-0 focus:border-0 focus:shadow-none focus-visible:outline-none shadow-none focus-visible:ring-0"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        name="message"
        rows={1}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e)
        }}
      />

      <div className="absolute border-0 inset-0 flex items-center pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{
                y: 7,
                opacity: 0
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1
              }}
              exit={{
                y: -15,
                opacity: 0
              }}
              transition={{
                duration: 0.52,
                ease: 'linear'
              }}
              className="dark:text-zinc-500 border-0 text-sm sm:text-lg font-normal text-neutral-500 pl-4 sm:pl-16 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
