"use server";

import { db } from "@/lib/db";
import { enrollments, payments } from "@/lib/db/schema";
import { createMidtransTransaction } from "@/lib/payment/midtrans";
import { createStripeCheckout } from "@/lib/payment/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

type StartCheckoutInput = {
  courseId: string;
  provider: "stripe" | "midtrans";
  courseTitle: string;
  amount: number;
  currency: string;
};

export async function startCheckout(input: StartCheckoutInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Anda harus login untuk membeli kursus");
  }

  const paymentId = crypto.randomUUID();

  // Create pending payment record
  await db.insert(payments).values({
    id: paymentId,
    userId: session.user.id,
    courseId: input.courseId,
    amount: input.amount.toString(),
    currency: input.currency,
    gateway: input.provider,
    status: "pending",
  });

  // Ensure enrollment exists with pending status
  await db
    .insert(enrollments)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      courseId: input.courseId,
      paymentStatus: "pending",
    })
    .onConflictDoUpdate({
      target: [enrollments.userId, enrollments.courseId],
      set: { paymentStatus: "pending" },
    });

  if (input.provider === "stripe") {
    if (process.env.NEXT_PUBLIC_ENABLE_STRIPE !== "true") {
      throw new Error("Stripe is currently disabled");
    }

    const checkoutSession = await createStripeCheckout({
      courseTitle: input.courseTitle,
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/my-courses?status=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${input.courseId}?status=cancelled`,
      metadata: {
        paymentId: paymentId,
        userId: session.user.id,
        courseId: input.courseId,
      },
    });

    return { provider: "stripe", checkoutUrl: checkoutSession.url };
  }

  if (process.env.NEXT_PUBLIC_ENABLE_MIDTRANS !== "true") {
    throw new Error("Midtrans is currently disabled");
  }

  const transaction = await createMidtransTransaction({
    orderId: paymentId,
    grossAmount: Math.round(input.amount),
    customerName: session.user.name,
    customerEmail: session.user.email,
  });

  return {
    provider: "midtrans",
    checkoutUrl: transaction.redirect_url,
  };
}

export async function enrollFreeCourse(courseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const locale = await getLocale();

  if (!session?.user) {
    throw new Error("Anda harus login untuk mendaftar kursus");
  }

  // Fetch course slug and first lesson ID
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, courseId),
    with: {
      modules: {
        orderBy: (m, { asc }) => [asc(m.order)],
        with: {
          lessons: {
            orderBy: (l, { asc }) => [asc(l.order)],
          },
        },
      },
    },
  });

  if (!course) throw new Error("Kursus tidak ditemukan");

  const firstLesson = course.modules[0]?.lessons[0];
  if (!firstLesson) throw new Error("Kursus ini belum memiliki materi");

  await db
    .insert(enrollments)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      courseId: courseId,
      paymentStatus: "paid",
    })
    .onConflictDoUpdate({
      target: [enrollments.userId, enrollments.courseId],
      set: { paymentStatus: "paid" },
    });

  redirect(`/${locale}/learn/${course.slug}/${firstLesson.id}` as any);
}
