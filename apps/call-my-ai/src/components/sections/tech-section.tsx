"use client"
import Link from "next/link"

import { techStack } from "@/data/tech-stack"

import { Icons } from "@/components/icons"
import { useEffect, useState } from "react"

export function TechSection(): JSX.Element {
  return (
    <section
      id="tech-section"
      aria-label="tech section"
      className="w-full bg-background py-8 grid"
    >
      <div
        className="container flex w-full max-w-4xl animate-fade-up flex-wrap place-items-center items-center justify-center gap-6 opacity-0 sm:gap-[38px] md:gap-[36px] lg:gap-x-12"
        style={{ animationDelay: "1s", animationFillMode: "forwards" }}
      >
        <div
          className="absolute bottom-0 left-1/2 aspect-[1/2] w-[150%] -translate-x-1/2 rounded-r-full opacity-20 blur-xl transition-colors duration-300 ease-in"
          style={{
            background: `radial-gradient(ellipse at bottom, #fb2ef1, transparent 70%)`,
          }}
        />
        <div className="relative z-10 flex h-full items-center justify-center text-white">
        </div>
      </div>
    </section>
  )
}
