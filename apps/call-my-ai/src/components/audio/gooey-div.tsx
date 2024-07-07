// GooeyDiv.tsx
import React, { useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"

import { gooeyAnimations } from "./animate"

interface GooeyDivProps {
  index: number
  primaryColor: string
  secondaryColor: string
  scale?: number
}

export const GooeyDiv: React.FC<GooeyDivProps> = ({
  index,
  primaryColor,
  secondaryColor,
  scale = 1,
}) => {
  const isOdd = index % 2 !== 0
  const animation = gooeyAnimations[index]
  const controls = useAnimation()
  const randomFactorRef = useRef(Math.random() * 20 - 10)

  useEffect(() => {
    const baseRadius = 30 + (scale - 1) * 80 // Map scale (1 to 1.5) to radius (30 to 70)
    const randomFactor = randomFactorRef.current

    const borderRadius = `${baseRadius + randomFactor}% ${100 - baseRadius + randomFactor}% ${70 + randomFactor}% ${30 + randomFactor}% / ${30 + randomFactor}% ${baseRadius + randomFactor}% ${100 - baseRadius + randomFactor}% ${70 + randomFactor}%`

    controls.start({
      borderRadius: borderRadius,
      scale: scale,
      transition: { duration: 0.1 },
    })
  }, [scale, controls])

  return (
    <motion.div
      className="absolute h-[200px] w-[200px]"
      style={{
        border: `2px solid ${isOdd ? primaryColor : secondaryColor}`,
        boxShadow: `0 0 20px 10px ${isOdd ? primaryColor : secondaryColor}`,
        filter: `blur(${index * 2 + 1}px)`,
      }}
      initial={{
        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
        scale: 1,
      }}
      animate={controls}
      variants={animation}
      transition={{
        duration: 8 + index,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}
