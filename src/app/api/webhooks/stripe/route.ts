import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { enrollments, payments } from "@/lib/db/schema";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Stripe webhook skipped: env not configured." }, { status: 202 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing stripe-signature header." }, { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { paymentId, userId, courseId } = session.metadata || {};

    if (paymentId && userId && courseId) {
      // Update payment status
      await db
        .update(payments)
        .set({ status: "paid" })
        .where(eq(payments.id, paymentId));

      // Update enrollment status
      await db
        .update(enrollments)
        .set({ paymentStatus: "paid" })
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));

      console.log(`Payment success for ${userId} on course ${courseId}`);
    }
  }

  return NextResponse.json({
    received: true,
    eventType: event.type,
  });
}
