import { PricingSection } from "@/components/sections/pricing-section"
import { PremiumFeatureNotice } from "@/components/paid-feature-notice"

interface PricingPageProps {
  searchParams: {
    feature?: string
  }
}

export default function PricingPage({ searchParams }: PricingPageProps): JSX.Element {
  const { feature } = searchParams

  return (
    <div className="flex min-h-screen w-full flex-col items-center sm:my-10 justify-start gap-8">
      {feature && (
        <PremiumFeatureNotice 
          feature={feature as "createAssistant" | "externalApps" | "externalFiles"}
        />
      )}
      <PricingSection />
    </div>
  )
}
