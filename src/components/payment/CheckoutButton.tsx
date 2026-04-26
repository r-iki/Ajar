"use client";

import { useState } from "react";
import { toast } from "sonner";
import { startCheckout } from "@/actions/payment";

type CheckoutButtonProps = {
  provider: "stripe" | "midtrans";
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
};

export function CheckoutButton({ provider, courseId, courseTitle, amount, currency }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);
      const response = await startCheckout({
        provider,
        courseId,
        courseTitle,
        amount,
        currency,
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal memproses pembayaran. Pastikan Anda sudah login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
        provider === "stripe" 
          ? "bg-[#635bff] text-white hover:bg-[#635bff]/90" 
          : "bg-[#002855] text-white hover:bg-[#002855]/90"
      }`}
    >
      {loading ? "Processing..." : `Bayar via ${provider === "stripe" ? "Stripe" : "Midtrans"}`}
    </button>
  );
}
