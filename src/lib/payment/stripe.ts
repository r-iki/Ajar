import Stripe from "stripe";

import { env } from "@/lib/env";

function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createStripeCheckout(input: {
  courseTitle: string;
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY belum diatur");
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: input.metadata,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency ?? "usd",
          unit_amount: Math.round(input.amount * 100),
          product_data: {
            name: input.courseTitle,
          },
        },
      },
    ],
  });
}
