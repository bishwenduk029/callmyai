"use client"

import Link from "next/link"
import { Numpad } from "@phosphor-icons/react"
import { Headset } from "@phosphor-icons/react/dist/ssr"

import { siteConfig } from "@/config/site"

export const Logo = () => (
  <Link
    href="/"
    className="flex items-center justify-center gap-2 text-lg font-bold tracking-wide text-background transition-all duration-300 ease-in-out"
  >
    <Headset size={35} className="text-green-500" weight="duotone" />
    <span className="hidden text-primary md:flex">{siteConfig.name}</span>
  </Link>
)
