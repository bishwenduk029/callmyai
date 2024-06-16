'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import React from 'react'

export default function IntroText() {
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  const FADE_DOWN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  }
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-5">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div>
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial="hidden"
          ref={ref}
          animate={isInView ? 'show' : 'hidden'}
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          <motion.h1
            variants={FADE_DOWN_ANIMATION_VARIANTS}
            className="text-2xl font-bold italic tracking-tight sm:text-3xl"
          >
            Organize Your Mind
          </motion.h1>
          <motion.p
            variants={FADE_DOWN_ANIMATION_VARIANTS}
            className="mt-6 text-xl leading-8 font-semibold italic"
          >
            Your personal AI powered memory organizer.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
