import midtransClient from "midtrans-client";

import { env } from "@/lib/env";

function getSnapClient() {
  if (!env.MIDTRANS_SERVER_KEY) {
    return null;
  }

  return new midtransClient.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
  });
}

export async function createMidtransTransaction(input: {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
}) {
  const snap = getSnapClient();

  if (!snap) {
    throw new Error("MIDTRANS_SERVER_KEY belum diatur");
  }

  // QRIS/GoPay ditunda ke fase terakhir sesuai arahan.
  return snap.createTransaction({
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    customer_details: {
      first_name: input.customerName,
      email: input.customerEmail,
    },
    enabled_payments: ["credit_card", "gopay", "bank_transfer", "cstore"],
  });
}
