"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { submitReview } from "@/actions/reviews";
import { toast } from "sonner";

export function ReviewForm({ courseId }: { courseId: string }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitReview(courseId, rating, comment);
      if (result.success) {
        toast.success("Terima kasih atas ulasan Anda!");
        setComment("");
      }
    } catch (error) {
      toast.error("Gagal mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border glass p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold italic tracking-tight uppercase">Berikan Ulasan</h3>
        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Bagaimana pengalaman belajar kamu?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform active:scale-90"
            >
              <Star 
                className={`size-8 transition-colors ${
                  star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                }`} 
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tuliskan pendapatmu tentang kursus ini..."
          className="w-full min-h-[120px] p-4 rounded-xl border bg-muted/20 focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none text-sm"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          {isSubmitting ? "Mengirim..." : (
            <>
              Kirim Testimoni
              <Send className="size-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
