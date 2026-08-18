import crypto from "crypto";
import { env } from "@/lib/env";

export function getDokuConfig() {
  const isProduction = process.env.DOKU_IS_PRODUCTION === "true";
  const baseUrl = isProduction ? "https://api.doku.com" : "https://api-sandbox.doku.com";
  const clientId = process.env.DOKU_CLIENT_ID || "";
  const secretKey = process.env.DOKU_SECRET_KEY || "";

  return {
    isProduction,
    baseUrl,
    clientId,
    secretKey,
  };
}

export function generateDokuDigest(bodyString: string): string {
  return crypto.createHash("sha256").update(bodyString, "utf8").digest("base64");
}

export function generateDokuSignature(params: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  digest: string;
  secretKey: string;
}): string {
  const component = `Client-Id:${params.clientId}\nRequest-Id:${params.requestId}\nRequest-Timestamp:${params.requestTimestamp}\nRequest-Target:${params.requestTarget}\nDigest:${params.digest}`;
  const hmac = crypto.createHmac("sha256", params.secretKey).update(component, "utf8").digest("base64");
  return `HMACSHA256=${hmac}`;
}

export async function createDokuCheckoutSession(input: {
  orderId: string;
  amount: number;
  courseTitle: string;
  courseSlug: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  locale: string;
  appUrl: string;
}) {
  const config = getDokuConfig();

  if (!config.clientId || !config.secretKey) {
    throw new Error("DOKU_CLIENT_ID atau DOKU_SECRET_KEY belum diatur di .env");
  }

  const requestId = crypto.randomUUID();
  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const requestTarget = "/checkout/v1/payment";

  const payload = {
    order: {
      invoice_number: input.orderId,
      amount: Math.round(input.amount),
      currency: "IDR",
      callback_url: `${input.appUrl}/${input.locale}/my-courses?status=success`,
      callback_url_cancel: `${input.appUrl}/${input.locale}/courses/${input.courseSlug}?status=cancelled`,
      auto_redirect: true,
      line_items: [
        {
          name: input.courseTitle.slice(0, 100),
          price: Math.round(input.amount),
          quantity: 1,
        },
      ],
    },
    payment: {
      payment_due_date: 60, // 60 minutes
    },
    customer: {
      id: input.userId,
      name: input.customerName || "Siswa Ajar",
      email: input.customerEmail,
    },
  };

  const bodyString = JSON.stringify(payload);
  const digest = generateDokuDigest(bodyString);
  const signature = generateDokuSignature({
    clientId: config.clientId,
    requestId,
    requestTimestamp,
    requestTarget,
    digest,
    secretKey: config.secretKey,
  });

  const response = await fetch(`${config.baseUrl}${requestTarget}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": config.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      Signature: signature,
    },
    body: bodyString,
  });

  const result = await response.json();

  if (!response.ok || !result?.response?.payment?.url) {
    const errorMsg = result?.error?.message || result?.message || JSON.stringify(result);
    throw new Error(`DOKU Checkout Error: ${errorMsg}`);
  }

  return {
    url: result.response.payment.url as string,
    invoiceNumber: (result.response.order?.invoice_number as string) || input.orderId,
  };
}

export function verifyDokuNotification(params: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  signature: string;
  bodyString: string;
}): boolean {
  const config = getDokuConfig();
  if (!config.secretKey) return false;

  const digest = generateDokuDigest(params.bodyString);
  const expectedSignature = generateDokuSignature({
    clientId: params.clientId,
    requestId: params.requestId,
    requestTimestamp: params.requestTimestamp,
    requestTarget: params.requestTarget,
    digest,
    secretKey: config.secretKey,
  });

  return params.signature === expectedSignature;
}
