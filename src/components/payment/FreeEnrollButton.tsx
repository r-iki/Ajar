"use client";

import { useState } from "react";
import { toast } from "sonner";
import { enrollFreeCourse } from "@/actions/payment";

type FreeEnrollButtonProps = {
  courseId: string;
};

export function FreeEnrollButton({ courseId }: FreeEnrollButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    try {
      setLoading(true);
      await enrollFreeCourse(courseId);
      toast.success("Berhasil mendaftar kursus!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal mendaftar. Pastikan Anda sudah login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={loading}
      className="w-full rounded-xl bg-muted px-4 py-3 text-sm font-bold transition-all hover:bg-muted/80 active:scale-95 disabled:opacity-50"
    >
      {loading ? "Enrolling..." : "Daftar Gratis Sekarang"}
    </button>
  );
}
