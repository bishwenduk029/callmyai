"use server"

import * as React from "react"
import Link from "next/link"
import { getUserSubscriptions } from "@/actions/payments"
import { getUserByEmail, updateUserCalls } from "@/actions/user"
import Balancer from "react-wrap-balancer"

import { siteConfig } from "@/config/site"
import { pricingPlans } from "@/data/pricing-plans"

import auth from "@/lib/auth"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"

import { buttonVariants } from "../ui/button"
import { redirect } from "next/navigation"

export async function PricingSection(): Promise<JSX.Element> {
  const session = await auth()
  console.log(session)

  if (!session || !session.user) {
    // User is not logged in, we'll show a simplified version of the pricing
    return <NonLoggedInPricingSection />
  }
  const userSubscriptions = await getUserSubscriptions()
  const hasActiveSubscription = userSubscriptions.some(
    (sub) => sub.status === "active"
  )

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
              <span className="bg-clip-text text-primary">Pricing!</span>
            </Balancer>
          </h2>
          <h3 className="max-w-2xl text-muted-foreground sm:text-xl sm:leading-8">
            <Balancer>
              {siteConfig.name} is open source. Simple pricing for everyone.
            </Balancer>
          </h3>
        </div>

        <div className="flex justify-center">
          <div className="grid w-full grid-cols-2 gap-4 md:gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col transition-all duration-1000 ease-out hover:-translate-y-3 hover:opacity-80"
                )}
              >
                <CardHeader className="overflow-hidden rounded-t-lg bg-primary text-secondary">
                  <CardTitle className="font-urbanist text-2xl tracking-wide">
                    <Balancer>{plan.name}</Balancer>
                  </CardTitle>

                  <CardDescription className="text-sm">
                    <Balancer>{plan.description}</Balancer>
                  </CardDescription>

                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex gap-2 text-4xl font-semibold">
                      <span className="flex items-center justify-center text-3xl font-normal">
                        $
                      </span>
                      <span>{plan.prices.monthly}</span>

                      <span className="flex items-end text-lg font-semibold">
                        / month
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-between text-sm lg:text-base">
                  <div className="grid gap-3 py-8">
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((item) => (
                        <li className="flex items-center gap-2" key={item}>
                          <Icons.check className="size-4" />
                          <Balancer>{item}</Balancer>
                        </li>
                      ))}
                    </ul>

                    <ul className="flex flex-col gap-2">
                      {plan.limitations.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <Icons.close className="size-4" />
                          <Balancer>{item}</Balancer>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {!hasActiveSubscription && (
                    <form
                      action={async () => {
                        "use server"
                        if (plan.id === "free") {
                          const user = await getUserByEmail({
                            email: session.user.email || "",
                          })
                          if (!user?.calls) {
                            await updateUserCalls(user?.id || "", 10)
                          }
                          redirect("/dashboard/settings")
                          return
                        }
                        const { getCheckoutURL } = await import(
                          "@/actions/payments"
                        )
                        const checkoutLink = await getCheckoutURL(
                          parseInt(plan.lemonSqueezyVariantId)
                        )
                        return checkoutLink
                      }}
                    >
                      <button
                        type="submit"
                        className={cn(
                          buttonVariants({
                            variant: "default",
                            className: "mt-4 w-full",
                          })
                        )}
                      >
                        {plan.buttonText}
                      </button>
                    </form>
                  )}
                </CardContent>
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
                  className: "w-1/2 items-center self-center",
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
    <section
      id="pricing-section"
      aria-label="pricing section"
      className="mx-auto"
    >
      <div className="container grid gap-4 md:gap-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-urbanist text-4xl font-extrabold tracking-tight sm:text-5xl">
            <Balancer>
              <span className="bg-clip-text text-primary">Pricing!</span>
            </Balancer>
          </h2>
          <h3 className="max-w-2xl text-muted-foreground sm:text-xl sm:leading-8">
            <Balancer>
              {siteConfig.name} is open source. Simple pricing for everyone.
            </Balancer>
          </h3>
        </div>

        <div className="flex justify-center">
          <div className="grid w-full grid-cols-2 gap-4 md:gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col transition-all duration-1000 ease-out hover:-translate-y-3 hover:opacity-80"
                )}
              >
                <CardHeader className="overflow-hidden rounded-t-lg bg-primary text-secondary">
                  <CardTitle className="font-urbanist text-2xl tracking-wide">
                    <Balancer>{plan.name}</Balancer>
                  </CardTitle>

                  <CardDescription className="text-sm">
                    <Balancer>{plan.description}</Balancer>
                  </CardDescription>

                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex gap-2 text-4xl font-semibold">
                      <span className="flex items-center justify-center text-3xl font-normal">
                        $
                      </span>
                      <span>{plan.prices.monthly}</span>

                      <span className="flex items-end text-lg font-semibold">
                        / month
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-between text-sm lg:text-base">
                  <div className="grid gap-3 py-8">
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((item) => (
                        <li className="flex items-center gap-2" key={item}>
                          <Icons.check className="size-4" />
                          <Balancer>{item}</Balancer>
                        </li>
                      ))}
                    </ul>

                    <ul className="flex flex-col gap-2">
                      {plan.limitations.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <Icons.close className="size-4" />
                          <Balancer>{item}</Balancer>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/signin"
                    type="submit"
                    className={cn(
                      buttonVariants({
                        variant: "default",
                        className: "mt-4 w-full",
                      })
                    )}
                  >
                    {plan.buttonText}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
