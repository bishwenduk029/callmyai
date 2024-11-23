"use server"

import {
  getUserSubscriptionByUserId
} from "@/actions/user"
import { Check, Cross } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import Balancer from "react-wrap-balancer"

import { siteConfig } from "@/config/site"
import { pricingPlans } from "@/data/pricing-plans"

import auth from "@/lib/auth"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { PricingButton } from "../pricing-button"
import { Button, buttonVariants } from "../ui/button"
import { Section } from "../ui/section"

export async function PricingSection(): Promise<JSX.Element> {
  const session = await auth()

  if (!session || !session.user) {
    // User is not logged in, we'll show a simplified version of the pricing
    return <NonLoggedInPricingSection />
  }

  const subscription = await getUserSubscriptionByUserId({
    userId: session.user.id!,
  })
  const hasActiveSubscription = !!subscription
  // const userSubscriptions = await getUserSubscriptions()
  // const hasActiveSubscription = userSubscriptions.some(
  //   (sub) => sub.status === "active"
  // )

  return (
    <section
      id="pricing-section"
      aria-label="pricing section"
      className="mx-auto"
    >
      <div className="container grid gap-4 md:gap-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-urbanist text-4xl font-extrabold tracking-tight sm:text-5xl">
            <Balancer>
              <span className="bg-clip-text text-foreground">Pricing!</span>
            </Balancer>
          </h2>
          <h3 className="max-w-2xl text-muted-foreground sm:text-xl sm:leading-8">
            <Balancer>
              {siteConfig.name} is open source. Simple pricing for everyone.
            </Balancer>
          </h3>
        </div>

        <div className="flex justify-center">
          <div className="grid w-full grid-cols-1 gap-4 px-5 sm:px-0 md:grid-cols-3 md:gap-8">
            {pricingPlans.map((plan) => (
              <Card
              key={plan.id}
              className={cn(
                "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg",
                plan.id === "premium" && "border-primary shadow-md"
              )}
            >
              <CardHeader className="space-y-2 bg-secondary/90 dark:bg-secondary/50">
                {plan.id === "premium" && (
                  <p className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                    Recommended
                  </p>
                )}
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-4xl font-extrabold">
                  ${plan.prices.monthly}
                  <span className="text-xl font-normal text-muted-foreground">
                    /{"month"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
                  {!hasActiveSubscription && (
                    <PricingButton
                      planId={plan.id}
                      paddlePriceId={plan.paddlePriceId}
                      buttonText={plan.buttonText}
                      isDisabled={plan.disable}
                      userEmail={session.user.email || ""}
                    />
                  )}
              </Card>
            ))}
          </div>
        </div>
        {hasActiveSubscription && (
          <div className="mt-8 flex w-full flex-row justify-center">
            <Link
              href="https://callmyai.lemonsqueezy.com/billing"
              className={cn(
                buttonVariants({
                  variant: "default",
                  className: "w-full items-center self-center md:w-1/2",
                })
              )}
            >
              Manage Subscriptions
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function NonLoggedInPricingSection(): JSX.Element {
  return (
    <Section id="pricing-section" aria-label="pricing section">
      <div className="w-full md:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-urbanist text-4xl font-extrabold tracking-tight sm:text-5xl">
            <Balancer>
              <span className="bg-clip-text text-foreground">Pricing!</span>
            </Balancer>
          </h2>
          <h3 className="max-w-2xl text-muted-foreground sm:text-xl sm:leading-8">
            <Balancer>Simple Pricing for Everyone.</Balancer>
          </h3>
        </div>

        <div className="flex justify-center mt-4">
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg",
                  plan.id === "premium" && "border-primary shadow-md"
                )}
              >
                <CardHeader className="space-y-2 bg-secondary/90 dark:bg-secondary/50">
                  {plan.id === "premium" && (
                    <p className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                      Recommended
                    </p>
                  )}
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-4xl font-extrabold">
                    ${plan.prices.monthly}
                    <span className="text-xl font-normal text-muted-foreground">
                      /{"month"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="bg-secondary/25 dark:bg-secondary/5">
                  <Button
                    className="w-full"
                    variant={plan.id === "premium" ? "default" : "outline"}
                    disabled={plan.disable}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
                {plan.limitations.length > 0 && (
                  <div className="px-6 pb-6">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Limitations:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.limitations.map((limitation) => (
                        <li
                          key={limitation}
                          className="flex items-center space-x-3"
                        >
                          <Cross className="h-4 w-4 flex-shrink-0 text-red-500" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
