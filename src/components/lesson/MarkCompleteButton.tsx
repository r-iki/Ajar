"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markLessonComplete } from "@/actions/lesson-progress";
import { CheckCircle } from "lucide-react";

type MarkCompleteButtonProps = {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
};

export function MarkCompleteButton({ lessonId, courseSlug, isCompleted }: MarkCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = () => {
    if (isCompleted) {
        toast.info("Materi ini sudah selesai Anda pelajari.");
        return;
    }

    startTransition(async () => {
      try {
        const result = await markLessonComplete(lessonId);
        if (result.success) {
          toast.success("Materi selesai!");
          if (result.nextLessonId) {
            router.push(`/learn/${courseSlug}/${result.nextLessonId}` as any);
          } else {
            router.refresh();
          }
        }
      } catch (error) {
        toast.error("Gagal menyimpan progress.");
      }
    });
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isPending || isCompleted}
      className={`flex items-center gap-2 rounded-xl px-8 py-3 font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70
        ${isCompleted 
          ? "bg-green-600 text-white cursor-default" 
          : "bg-primary text-primary-foreground hover:scale-105"
        }`}
    >
      {isPending ? (
        "Menyimpan..."
      ) : isCompleted ? (
        <>
          <CheckCircle className="size-5" />
          Selesai
        </>
      ) : (
        "Selesai & Lanjut"
      )}
    </button>
  );
}
