'use client'

// import {
//   FADE_DOWN_ANIMATION_VARIANTS,
//   FADE_UP_ANIMATION_VARIANTS,
// } from "@/lib/constants";
import { motion, useInView } from 'framer-motion'
import React from 'react'
// import { useInView } from "react-intersection-observer";
import Image from 'next/image'
import { HeartFilledIcon } from '@radix-ui/react-icons'
import { Avatar, AvatarImage } from './ui/avatar'

const features = [
  {
    name: 'Turn your thoughts into actions.',
    description:
      'Speak your thoughts out loud and Ava will automatically organize them for you.',
    icon: () => (
      <Avatar
        className="absolute left-1 top-1 size-7 text-muted-foreground"
        aria-hidden="true"
      >
        <AvatarImage
          src="https://blush.design/api/download?shareUri=GRS5_tajEAqiPGmh&c=Skin_0%7Eedb98a&w=800&h=800&fm=png"
          alt="@shadcn"
        />
      </Avatar>
    )
  },
  {
    name: 'Record anything notes, summary, tasks and more.',
    description:
      'All transcriptions are automatically tagged for efficient organization.',
    icon: () => (
      <Avatar
        className="absolute left-1 top-1 size-7 text-muted-foreground"
        aria-hidden="true"
      >
        <AvatarImage
          src="https://blush.design/api/download?shareUri=dFs5ZiM3tGi_cEFI&c=Skin_0%7Eedb98a&w=800&h=800&fm=png"
          alt="@shadcn"
        />
      </Avatar>
    )
  },
  {
    name: 'Record anything notes, summary, tasks and more.',
    description:
      'All transcriptions are automatically tagged for efficient organization.',
    icon: () => (
      <Avatar
        className="absolute left-1 top-1 size-7 text-muted-foreground"
        aria-hidden="true"
      >
        <AvatarImage
          src="https://blush.design/api/download?shareUri=dFs5ZiM3tGi_cEFI&c=Skin_0%7Eedb98a&w=800&h=800&fm=png"
          alt="@shadcn"
        />
      </Avatar>
    )
  },
]

export default function Info() {
  //   const { ref: refBottom, inView: inViewBottom } = useInView({
  //     triggerOnce: false,
  //   });
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  const FADE_DOWN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } }
  }
  return (
    <div className="overflow-hidden mx-auto flex flex-row justify-center">
      <div className="mx-auto px-6 lg:px-10">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <motion.div
                ref={ref}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
                viewport={{ once: false }}
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.15
                    }
                  }
                }}
              >
                <dl className="max-w-2xl space-y-8 leading-7">
                  {features.map(feature => (
                    <motion.div
                      key={feature.name}
                      variants={FADE_DOWN_ANIMATION_VARIANTS}
                      className="relative pl-9 text-lg"
                    >
                      <dt className="inline font-semibold">
                        <feature.icon />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </motion.div>
                  ))}
                </dl>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
