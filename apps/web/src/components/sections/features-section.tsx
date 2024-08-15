"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Call Handling",
      description:
        "Our advanced AI voice bot takes calls on your behalf, saving you time and reducing interruptions.",
    },
    {
      title: "Smart Call Summarization",
      description:
        "Receive concise, tweet-like summaries of all your calls, making it easy to review and prioritize follow-ups.",
    },
    {
      title: "Web-Based Accessibility",
      description:
        "No phone integration required. Callers simply use a unique web link to reach your AI assistant.",
    },
    {
      title: "Customizable Filtering",
      description:
        "Set your preferences and let the AI filter out irrelevant calls, focusing only on what matters to you.",
    },
    {
      title: "Enterprise-Ready Solution",
      description:
        "Powerful tools for businesses to reach multiple users efficiently, with scalable access options.",
    },
    {
      title: "Privacy-First Approach",
      description:
        "Your data security is our priority. All conversations are handled with strict privacy measures.",
    },
    {
      title: "Flexible Pricing Options",
      description:
        "Choose from our range of plans, from individual users to large enterprises, with no hidden fees.",
    },
    {
      title: "24/7 Availability",
      description:
        "Your AI assistant is always on duty, ensuring you never miss an important call, day or night.",
    },
  ]
  return (
    <div className="relative z-10 mx-auto grid  max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  )
}

const Feature = ({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "font-urbanist group/feature dark:border-neutral-800 relative  flex flex-col py-10 lg:border-r",
        (index === 0 || index === 4) && "dark:border-neutral-800 lg:border-l",
        index < 4 && "dark:border-neutral-800 lg:border-b"
      )}
    >
      {index < 4 && (
        <div className="dark:from-primary-800 from-primary-100 pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
      )}
      {index >= 4 && (
        <div className="dark:from-primary-800 from-primary-100 pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
      )}
      <div className="relative z-10 mb-2 px-10 text-lg font-bold">
        <div className="dark:bg-neutral-700 absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-blue-500" />
        <span className="dark:text-primary inline-block text-primary transition duration-200 group-hover/feature:translate-x-2">
          {title}
        </span>
      </div>
      <p className="dark:text-neutral-300 relative z-10 max-w-xs px-10 text-sm text-neutral-600">
        {description}
      </p>
    </motion.div>
  )
}
