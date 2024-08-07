"use client"

import { siteConfig } from "@/config/site"
import { Numpad } from "@phosphor-icons/react"
import Link from "next/link"

export const Logo = () => (
  <Link
    href="/"
    className="flex items-center justify-center gap-2 text-lg font-bold tracking-wide transition-all duration-300 ease-in-out"
  >
    <Numpad size={25} className="text-green-500" />
    <span className="hidden md:flex">{siteConfig.name}</span>
  </Link>
)
