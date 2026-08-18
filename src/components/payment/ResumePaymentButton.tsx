"use client";

import { CreditCard } from "lucide-react";
import { Link } from "@/i18n/navigation";

type ResumePaymentButtonProps = {
  courseSlug: string;
};

export function ResumePaymentButton({ courseSlug }: ResumePaymentButtonProps) {
  return (
    <Link
      href={`/courses/${courseSlug}`}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-[10px] font-black text-white transition-all hover:bg-amber-600 active:scale-95 shadow-lg shadow-amber-500/20"
    >
      <CreditCard className="size-3" />
      Selesaikan Pembayaran
    </Link>
  );
}
