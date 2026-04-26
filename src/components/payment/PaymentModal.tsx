"use client";

import { useState } from "react";
import { features } from "@/lib/features";

import { CheckoutButton } from "@/components/payment/CheckoutButton";

type PaymentModalProps = {
  courseId: string;
  courseTitle: string;
  price: number;
  currency?: string;
};

export function PaymentModal({ courseId, courseTitle, price, currency = "IDR" }: PaymentModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-lg border px-4 py-2 text-sm"
      >
        {open ? "Tutup Opsi Pembayaran" : "Buka Opsi Pembayaran"}
      </button>

      {open ? (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          {features.stripe && (
            <CheckoutButton 
              provider="stripe" 
              courseId={courseId}
              courseTitle={courseTitle} 
              amount={price} 
              currency={currency}
            />
          )}
          
          {features.midtrans && (
            <CheckoutButton 
              provider="midtrans" 
              courseId={courseId}
              courseTitle={courseTitle} 
              amount={price} 
              currency={currency}
            />
          )}

          {!features.stripe && !features.midtrans && (
             <p className="text-xs text-center text-muted-foreground py-2">
               Tidak ada metode pembayaran yang aktif saat ini.
             </p>
           )}
          
          <p className="text-xs text-muted-foreground">Catatan: QRIS/GoPay belum diaktifkan pada fase ini.</p>
        </div>
      ) : null}
    </div>
  );
}
