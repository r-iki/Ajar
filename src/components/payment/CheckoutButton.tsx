"use client";

import { useState } from "react";
import { toast } from "sonner";
import { startCheckout } from "@/actions/payment";
import { useTranslations } from "next-intl";

type CheckoutButtonProps = {
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
};

export function CheckoutButton({ courseId, courseTitle, amount, currency }: CheckoutButtonProps) {
  const t = useTranslations("courses");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);
      const response = await startCheckout({
        courseId,
        courseTitle,
        amount,
        currency,
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error("Gagal membuat sesi pembayaran DOKU.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal memproses pembayaran. Pastikan Anda sudah login.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
    >
      {loading ? "..." : t("payWithDoku")}
    </button>
  );
}
