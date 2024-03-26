import { Fraunces as FontSans } from "next/font/google"
import localFont from "next/font/local"

import "@/styles/globals.css"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"

import { Providers } from "./provider"
import { Toaster } from "@/components/ui/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  weight: "400", // or any other weight you need
  variable: "--font-sans",
})

const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Autopilot",
    "AI",
    "Co-pilot",
    "Writing assistant",
    "Writing Co-pilot",
    "AI Writing Assistant",
    "Content Creation Tool",
    "AI for Content Writers",
    "Autopilot Writing Software",
    "Creative Writing AI",
    "AI-Powered Content Generation",
    "Automated Writing Co-pilot",
    "AI Content Optimization",
    "SEO-Friendly Writing Assistant",
    "Artificial Intelligence for Writers",
    "ChatGPT-Alternative Writing Assistant",
    "GPT-4 alternative",
    "ChatGPT alternative",
    "Advanced AI Writing Software",
    "Next-Gen AI for Content Creation",
  ],
  authors: [
    {
      name: "Sayanti",
      url: `${NEXT_PUBLIC_APP_URL}/`,
    },
  ],
  creator: "Sayanti",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/opengraph-image.png`],
    creator: "@SayantiKundu87",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dynamic meta tags */}
        <meta name="title" content={metadata.title.default} />
        <meta name="description" content={metadata.description} />
        {metadata.keywords && (
          <meta name="keywords" content={metadata.keywords.join(", ")} />
        )}
        {metadata.authors &&
          metadata.authors.map((author) => (
            <meta name="author" content={author.name} key={author.name} />
          ))}
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:locale" content={metadata.openGraph.locale} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        {metadata.openGraph.images &&
          metadata.openGraph.images.map((image, index) => (
            <meta property="og:image" content={image} key={index} />
          ))}
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        {metadata.twitter.images &&
          metadata.twitter.images.map((image, index) => (
            <meta name="twitter:image" content={image} key={index} />
          ))}
        <meta name="twitter:creator" content={metadata.twitter.creator} />

        <meta
          name="google-site-verification"
          content={`${process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}`}
        />

        {/* Favicon and Icons */}
        <link rel="icon" href={metadata.icons.icon} />
        <link rel="shortcut icon" href={metadata.icons.shortcut} />
        <link rel="apple-touch-icon" href={metadata.icons.apple} />
        <link rel="manifest" href={metadata.manifest} />
        {/* <script async src="https://umami-jmlc.onrender.com/script.js" data-website-id="140ef2fe-87c3-44a3-bcc2-f7bee6311db0"></script> */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Providers>
          {children}
          <Toaster />
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
