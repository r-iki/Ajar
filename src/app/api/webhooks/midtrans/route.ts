import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { enrollments, payments } from "@/lib/db/schema";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  if (!env.MIDTRANS_SERVER_KEY) {
    return NextResponse.json({ message: "Midtrans webhook skipped: env not configured." }, { status: 202 });
  }

  const payload = await request.json();
  const { order_id, transaction_status } = payload;

  // Midtrans status mapping
  // capture = paid (CC), settlement = paid (VA/QRIS), etc.
  const isPaid = ["capture", "settlement"].includes(transaction_status);
  const isFailed = ["deny", "expire", "cancel"].includes(transaction_status);

  if (isPaid || isFailed) {
    const status = isPaid ? "paid" : "failed";

    // Find the payment record to get userId and courseId
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, order_id))
      .limit(1);

    if (payment.length > 0) {
      const p = payment[0];

      // Update payment status
      await db
        .update(payments)
        .set({ status })
        .where(eq(payments.id, order_id));

      // Update enrollment status
      await db
        .update(enrollments)
        .set({ paymentStatus: status })
        .where(and(eq(enrollments.userId, p.userId), eq(enrollments.courseId, p.courseId)));

      console.log(`Midtrans payment ${status} for order ${order_id}`);
    }
  }

  return NextResponse.json({
    received: true,
    orderId: order_id,
    transactionStatus: transaction_status,
  });
}
