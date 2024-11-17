import { redirect } from "next/navigation"

import auth from "@/lib/auth"

import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PricingSection } from "@/components/sections/pricing-section"
import Hero from "@/components/sections/hero"
import { CreateAssistantSection } from "@/components/sections/create-assistant-section"

export default async function LandingPage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard/settings")
  }

  return (
    <div className="grid w-full grid-cols-1 items-center justify-center gap-16 font-urbanist">
      <Hero />
      <CreateAssistantSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
    </div>
  )
}
