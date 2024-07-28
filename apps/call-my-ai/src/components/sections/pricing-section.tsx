"use server"

import * as React from "react"
import Link from "next/link"
import { getCheckoutURL } from "@/actions/payments"
import Balancer from "react-wrap-balancer"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { pricingPlans } from "@/data/pricing-plans"

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

export async function PricingSection(): Promise<JSX.Element> {
  const checkoutLink = await getCheckoutURL(
    parseInt(env.LEMONSQUEEZY_VARIANT_ID)
  )
  return (
    <section
      id="pricing-section"
      aria-label="pricing section"
      className="w-full"
    >
      <div className="container grid max-w-6xl gap-4 md:gap-8">
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

        {/* <div className="my-4 flex items-center justify-center gap-4 text-lg">
          <span>Monthly</span>
          <Switch
            checked={yearlyBilling}
            onCheckedChange={() => setYearlyBilling((prev) => !prev)}
            role="switch"
            aria-label="switch-year"
          />
          <span>Annual</span>
        </div> */}

        <div className="flex justify-center">
          <div className="w-full max-w-md">
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
                    href={checkoutLink || ""}
                    className={cn(
                      buttonVariants({
                        variant: "default",
                        className: "mt-4 w-full",
                      })
                    )}
                  >
                    Purchase
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
