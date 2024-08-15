import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { PricingSection } from "@/components/sections/pricing-section"

export default function LandingPage() {
  return (
    <div className="font-urbanist grid w-full grid-cols-1 items-center justify-center gap-16">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
    </div>
  )
}
