"use client";

import { useState } from "react";
import { CheckoutButton } from "@/components/payment/CheckoutButton";
import { useTranslations } from "next-intl";

type PaymentModalProps = {
  courseId: string;
  courseTitle: string;
  price: number;
  currency?: string;
};

export function PaymentModal({ courseId, courseTitle, price, currency = "IDR" }: PaymentModalProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("courses");

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-all active:scale-95 shadow-2xs"
      >
        {open ? t("closePaymentOptions") : t("buyCourse")}
      </button>

      {open ? (
        <div className="space-y-4 rounded-3xl border border-border bg-card/95 backdrop-blur-md p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-tight text-foreground">{t("paymentSummary")}</h4>
            <div className="flex justify-between text-xs font-bold pt-1">
              <span className="text-muted-foreground truncate max-w-[200px]">{courseTitle}</span>
              <span className="font-mono text-primary font-black">{new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(price)}</span>
            </div>
          </div>
          
          <CheckoutButton 
            courseId={courseId}
            courseTitle={courseTitle} 
            amount={price} 
            currency={currency}
          />
          
          <p className="text-[10px] text-center text-muted-foreground leading-tight font-medium">
            {t("dokuSecureNote")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
