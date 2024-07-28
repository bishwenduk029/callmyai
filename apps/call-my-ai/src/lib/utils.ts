import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { env } from "@/env.mjs"
import { Subscription } from "@lemonsqueezy/lemonsqueezy.js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export async function getGitHubStars(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/pjborowiecki/SAASY-LAND-Next-14-Starters-With-Authentication-And-Database-Implemented",
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        next: {
          revalidate: 60,
        },
      }
    )

    if (!response.ok) return null

    const data = (await response.json()) as { stargazers_count: number }

    return data.stargazers_count
  } catch (err) {
    console.error(err)
    return null
  }
}

export function formatPrice(priceInCents: string) {
  const price = parseFloat(priceInCents);
  const dollars = price / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // Use minimumFractionDigits to handle cases like $59.00 -> $59
    minimumFractionDigits: dollars % 1 !== 0 ? 2 : 0,
  }).format(dollars);
}

export function checkRequiredEnv() {
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    throw new Error("Missing LEMONSQUEEZY_API_KEY. Set it in your .env file.");
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    throw new Error("Missing LEMONSQUEEZY_STORE_ID. Set it in your .env file.");
  }

  if (!process.env.LEMONSQUEEZY_STORE_ID) {
    throw new Error("Missing LEMONSQUEEZY_API_KEY. Set it in your .env file.");
  }
}

export function isValidSubscription(
  status: Subscription["data"]["attributes"]["status"],
) {
  return status !== "cancelled" && status !== "expired" && status !== "unpaid";
}

export function takeUniqueOrThrow<T extends unknown[]>(values: T): T[number] {
  if (values.length !== 1)
    throw new Error("Found non unique or inexistent value");
  return values[0];
}
