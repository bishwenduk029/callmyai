"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export default function IndexPage() {
  return (
    <>
      <section className="text-theme relative flex flex-col space-y-4 pb-8 md:pb-12 lg:py-16">
        <div className="z-0 w-full p-4">
          <div className="container flex flex-col items-center gap-4 text-center">
            <Link
              href={siteConfig.links.twitter}
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
              target="_blank"
            >
              Follow along on Twitter
            </Link>
            <h1 className="font-heading text-xl sm:text-2xl md:text-5xl lg:text-6xl">
              Meet Ava - Your Next-Level Autonomous Virtual Assistant
            </h1>
            <p className="max-w-[52rem] text-center text-xl text-muted-foreground sm:leading-8">
              Discover the future of personalized assistance. Ava isn't just any AI, it's your personal assistant, designed to learn from your conversations for unparalleled personalization. Streamline your daily digital tasks with ease.
            </p>
            <div className="m-5 flex w-full flex-col items-center justify-center gap-5 md:flex-row md:gap-x-5">
              <Link
                href="/chat"
                className={`${cn(buttonVariants({ size: "lg" }))}`}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 right-[10px] hidden h-[350px] w-[450px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#FFCC99_39.0625%,rgba(255,204,153,0)_100%)] blur-[123px] md:block"></div>
        <div className="absolute left-[10px] top-[300px] hidden h-[450px] w-[450px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#FFCC99_39.0625%,rgba(255,204,153,0)_100%)] blur-[123px] md:block"></div>

        
      </section>

      <section
        id="features"
        className="text-theme container space-y-6 bg-transparent py-8 dark:bg-transparent"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Power of Privacy and Performance in Your Hands
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border border-b-8 border-r-8 border-slate-900 p-2">
            <div className="flex h-[200px] flex-col justify-between rounded-md p-5">
              <div className="space-y-2">
                <h3 className="font-bold">Voice Controlled</h3>
                <p className="text-md text-muted-foreground">
                  Use voice to chat with Ava, just like chatting to a human.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-b-8 border-r-8 border-slate-900 p-2">
            <div className="flex h-[200px] flex-col justify-between rounded-md p-5">
              {/* <svg viewBox="0 0 24 24" className="h-12 w-12 fill-current">
                <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 0 0-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44a23.476 23.476 0 0 0-3.107-.534A23.892 23.892 0 0 0 12.769 4.7c1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442a22.73 22.73 0 0 0-3.113.538 15.02 15.02 0 0 1-.254-1.42c-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87a25.64 25.64 0 0 1-4.412.005 26.64 26.64 0 0 1-1.183-1.86c-.372-.64-.71-1.29-1.018-1.946a25.17 25.17 0 0 1 1.013-1.954c.38-.66.773-1.286 1.18-1.868A25.245 25.245 0 0 1 12 8.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933a25.952 25.952 0 0 0-1.345-2.32zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493a23.966 23.966 0 0 0-1.1-2.98c.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98a23.142 23.142 0 0 0-1.086 2.964c-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39a25.819 25.819 0 0 0 1.341-2.338zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143a22.005 22.005 0 0 1-2.006-.386c.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295a1.185 1.185 0 0 1-.553-.132c-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
              </svg> */}
              <div className="space-y-2">
                <h3 className="font-bold">Search Everything</h3>
                <p className="text-md text-muted-foreground">
                  Up to date with latest web knowledge. Search anything.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-b-8 border-r-8 border-slate-900 p-2">
            <div className="flex h-[200px] flex-col justify-between rounded-md p-5">
              <div className="space-y-2">
                <h3 className="font-bold">Intuitive Chat Experience</h3>
                <p className="text-md text-muted-foreground">
                  Ava's interface makes actionable AI accessible.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-b-8 border-r-8 border-slate-900 p-2">
            <div className="flex h-[200px] flex-col justify-between rounded-md p-5">
              <div className="space-y-2">
                <h3 className="font-bold">Smooth Conversation Experience</h3>
                <p className="text-md text-muted-foreground">
                  Streaming responses in well formatted text to serve your needs.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-b-8 border-r-8 border-slate-900 p-2">
            <div className="flex h-[200px] flex-col justify-between rounded-md p-5">
              <div className="space-y-2">
                <h3 className="font-bold">Personal Assistant</h3>
                <p className="text-md text-muted-foreground">
                  An assistant that gets to know you so as to serve you better.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-b-8 border-r-8 border-slate-900 p-2">
            <div className="flex h-[200px] flex-col justify-between rounded-md p-5">
              <div className="space-y-2">
                <h3 className="font-bold">Privacy</h3>
                <p className="text-md text-muted-foreground">
                  We do not use your data to train or fine-tune our models and
                  also do not store your data anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="open-source" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Proudly Open Source
          </h2>
          <p className="max-w-[85%] leading-normal sm:text-lg sm:leading-7">
            Powered by open source software. The code is available on <a className="underline" href="">GitHub.</a>
          </p>
        </div>
      </section>
    </>
  )
}
