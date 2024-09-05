import { Nunito, Inter } from "next/font/google"

export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const fontUrbanist = Inter({
  subsets: ["latin"],
  variable: "--font-urbanist",
})

export const fontHeading = Nunito({
  subsets: ["cyrillic"],
  variable: "--font-heading",
})
