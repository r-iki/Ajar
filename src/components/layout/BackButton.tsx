"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
    >
      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
      <span>Kembali ke halaman sebelumnya</span>
    </button>
  );
}
