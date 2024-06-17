'use client'

import { AnimatePresence, delay, motion, useInView } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

const FADE_IN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' }, delay: 3000 }
}

export default function IntroText() {
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  const FADE_DOWN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  }
  return (
    <div className="m-auto max-w-8xl px-6 lg:px-8 mt-5">
      <div className="w-full text-center">
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
          <motion.header
            variants={FADE_DOWN_ANIMATION_VARIANTS}
            className="font-bold italic tracking-tight text-4xl z-10"
          >
            Organize Your Mind
          </motion.header>
          <motion.p
            variants={FADE_DOWN_ANIMATION_VARIANTS}
            className="mt-6 text-xl leading-8 font-semibold italic z-10"
          >
            Your personal AI powered memory organizer.
          </motion.p>
        </motion.div>
        <motion.img
            alt="text"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, type: "tween" }}
            className="relaitve rounded-full p-0 -mb-10"
            src="/Diary.gif"
          />
      </div>
    </div>
  )
}
