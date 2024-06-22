import localFont from 'next/font/local'
import { Alegreya, Cormorant, DM_Sans, Eczar, Fraunces, Neuton, Playfair, Poppins, Raleway, Raleway_Dots } from 'next/font/google'

import '@/app/globals.css'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

// const fonts = localFont({
//   src: './fonts/SNPro/SNPro-Variable.woff2',
//   display: 'swap'
// })

const fonts = Raleway({
  weight: "variable",
  display: 'swap',
  subsets: ['latin']
})

export const metadata = {
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined,
  title: {
    default: 'Smriti | Your personal AI Powered Memory',
    template: `%s - Smriti`
  },
  description: 'An AI-powered Memory Organizer',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fonts.className}>
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1 bg-background h-screen">
              {children}
            </main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
