import { SiteConfig } from "@/types"

const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL

export const siteConfig: SiteConfig = {
  name: "Ava",
  description:
    "Your own private autonomous virtual assistant",
  url: `${NEXT_PUBLIC_APP_URL}/`,
  ogImage: `${NEXT_PUBLIC_APP_URL}/opengraph-image.png`,
  links: {
    twitter: "https://www.youtube.com/channel/UCJB34bxHv_IQ6ItBdHe2Vpw",
    github: `${NEXT_PUBLIC_APP_URL}/`,
    email: "mailto:bishwenduk029@gmail.com",
    privacy: `${NEXT_PUBLIC_APP_URL}/privacy`,
  },
}
