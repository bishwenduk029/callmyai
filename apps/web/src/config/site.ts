import { type NavItem, type NavItemFooter } from "@/types"

import { env } from "@/env.mjs"

const links = {
  github:
    "https://github.com/bishwenduk029/ai-voice",
  twitter: "https://twitter.com/bishwenduk029",
  linkedin: "https://www.linkedin.com/in/bishwendu.kundu",
  discord: "",
  authorsWebsite: "",
  authorsGitHub: "https://github.com/bishwenduk029",
  openGraphImage: `${env.NEXT_PUBLIC_APP_URL}/images/opengraph-image.png`,
  manifestFile: "",
}

export const siteConfig = {
  name: "callmyai.app",
  description: "Open Call Assistant Infrasrtucture",
  links,
  url: "https://callmyai.app",
  ogImage: links.openGraphImage,
  author: "bishwenduk029",
  hostingRegion: "us-east-1",
  keywords: [
    "voice",
    "assistant",
    "OpenAI",
    "Anthropic",
    "ai",
    "chatbot",
    "call-assistant",
  ],
  navItems: [
    // {
    //   title: "About",
    //   href: "/about",
    // },
    // {
    //   title: "Features",
    //   href: "/#features",
    // },
    {
      title: "Pricing",
      href: "/#pricing-section",
    },
    {
      title: "FAQ",
      href: "/#faq-section",
    },
    // {
    //   title: "Docs",
    //   href: "/docs",
    // },
    // {
    //   title: "Blog",
    //   href: "/blog",
    // },
  ] satisfies NavItem[],
  navItemsMobile: [],
  navItemsFooter: [
    // {
    //   title: "Company",
    //   items: [
    //     {
    //       title: "About",
    //       href: "/about",
    //       external: false,
    //     },
    //     {
    //       title: "Privacy",
    //       href: "/privacy",
    //       external: false,
    //     },
    //     {
    //       title: "Terms",
    //       href: "/tos",
    //       external: false,
    //     },
    //     {
    //       title: "Careers",
    //       href: "/careers",
    //       external: false,
    //     },
    //   ],
    // },
    // {
    //   title: "Support",
    //   items: [
    //     {
    //       title: "Docs",
    //       href: "/docs",
    //       external: false,
    //     },
    //     {
    //       title: "FAQ",
    //       href: "/faq",
    //       external: false,
    //     },
    //     {
    //       title: "Blog",
    //       href: "/blog",
    //       external: false,
    //     },
    //     {
    //       title: "Contact",
    //       href: "/contact",
    //       external: false,
    //     },
    //   ],
    // },
    // {
    //   title: "Inspiration",
    //   items: [
    //     {
    //       title: "Shadcn",
    //       href: "https://ui.shadcn.com/",
    //       external: true,
    //     },
    //     {
    //       title: "Taxonomy",
    //       href: "https://tx.shadcn.com/",
    //       external: true,
    //     },
    //     {
    //       title: "Skateshop",
    //       href: "https://skateshop.sadmn.com/",
    //       external: true,
    //     },
    //     {
    //       title: "Acme Corp",
    //       href: "https://acme-corp.jumr.dev/",
    //       external: true,
    //     },
    //   ],
    // },
  ] satisfies NavItemFooter[],
}
