import Stripe from "stripe";
import { env } from "@/lib/env";

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createStripeCheckoutSession(input: {
  orderId: string;
  amount: number;
  currency: string;
  courseTitle: string;
  courseId: string;
  userId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY belum diatur");
  }

  // IDR is a zero-decimal currency in Stripe
  const unitAmount =
    input.currency.toLowerCase() === "idr"
      ? Math.round(input.amount)
      : Math.round(input.amount * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: {
            name: input.courseTitle.substring(0, 100),
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: input.orderId,
      userId: input.userId,
      courseId: input.courseId,
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  return session;
}
