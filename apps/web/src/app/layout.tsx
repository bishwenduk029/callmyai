import "@/styles/globals.css"
import "@/styles/mdx.css"

import { Analytics } from "@vercel/analytics/react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import * as React from "react"

import { fontHeading, fontInter, fontUrbanist } from "@/config/fonts"
import { siteConfig } from "@/config/site"
import { env } from "@/env.mjs"

import { cn } from "@/lib/utils"
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider"
import { ThemeProvider } from "@/providers/theme-provider"

import { Toaster } from "@/components/ui/toaster"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.links.authorsWebsite,
    },
  ],
  creator: siteConfig.author,
  keywords: siteConfig.keywords,
  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.links.openGraphImage],
    creator: siteConfig.author,
  },
  icons: {
    icon: "/favicon.ico",
  },
  // manifest: siteConfig.links.manifestFile,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className="overflow-x-hidden overflow-y-scroll">
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteConfig.url} />
        <meta property="og:title" content={siteConfig.name} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content={siteConfig.links.openGraphImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteConfig.name} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content={siteConfig.links.openGraphImage} />
        <meta name="twitter:creator" content={siteConfig.author} />
        <meta property="linkedin:title" content={siteConfig.name} />
        <meta property="linkedin:description" content={siteConfig.description} />
        <meta property="linkedin:image" content={siteConfig.links.openGraphImage} />
        <meta property="linkedin:url" content={siteConfig.url} />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5J5ZJMMC');
          `}
        </Script>
      </head>
      <body
        className={cn(
          "w-full bg-background font-sans antialiased",
          fontInter.variable,
          fontUrbanist.variable,
          fontHeading.variable
        )}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
          </ThemeProvider>
      </body>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-5J5ZJMMC"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript>
    </html>
  )
}
