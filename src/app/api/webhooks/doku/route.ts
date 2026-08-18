import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enrollments, payments } from "@/lib/db/schema";
import { verifyDokuNotification, getDokuConfig } from "@/lib/payment/doku";

export async function POST(request: Request) {
  const config = getDokuConfig();

  const clientId = request.headers.get("client-id") || "";
  const requestId = request.headers.get("request-id") || "";
  const requestTimestamp = request.headers.get("request-timestamp") || "";
  const signature = request.headers.get("signature") || "";
  const requestTarget = "/api/webhooks/doku";

  const bodyText = await request.text();

  // If secret key is configured, verify signature
  if (config.secretKey) {
    const isValid = verifyDokuNotification({
      clientId,
      requestId,
      requestTimestamp,
      requestTarget,
      signature,
      bodyString: bodyText,
    });

    if (!isValid) {
      console.warn("DOKU webhook invalid signature received.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }
  }

  try {
    const data = JSON.parse(bodyText);
    const invoiceNumber = data?.order?.invoice_number;
    const transactionStatus = data?.transaction?.status;

    if (!invoiceNumber) {
      return NextResponse.json({ message: "Missing invoice_number" }, { status: 400 });
    }

    if (transactionStatus === "SUCCESS" || transactionStatus === "PAID") {
      // Find the payment
      const payment = await db.query.payments.findFirst({
        where: eq(payments.id, invoiceNumber),
      });

      if (payment) {
        // Update payment status
        await db
          .update(payments)
          .set({ status: "paid" })
          .where(eq(payments.id, invoiceNumber));

        // Update enrollment status
        await db
          .update(enrollments)
          .set({ paymentStatus: "paid" })
          .where(
            and(
              eq(enrollments.userId, payment.userId),
              eq(enrollments.courseId, payment.courseId)
            )
          );

        console.log(`DOKU payment success for order ${invoiceNumber}`);
      }
    }

    return NextResponse.json({ message: "Notification processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing DOKU webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
