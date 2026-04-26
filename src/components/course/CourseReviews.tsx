"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { getCourseReviews, getCourseRatingSummary } from "@/actions/reviews";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  };
};

export function CourseReviews({ courseId }: { courseId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState({ average: "0.0", count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reviewData, summaryData] = await Promise.all([
          getCourseReviews(courseId),
          getCourseRatingSummary(courseId),
        ]);
        setReviews(reviewData as any);
        setSummary(summaryData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) return <div className="h-40 bg-muted animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="text-center space-y-1">
          <p className="text-5xl font-black tracking-tighter text-primary">{summary.average}</p>
          <div className="flex justify-center text-yellow-400">
             {[...Array(5)].map((_, i) => (
                <Star key={i} className={`size-4 ${i < Math.floor(Number(summary.average)) ? "fill-current" : ""}`} />
             ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{summary.count} Ulasan</p>
        </div>
        <div className="h-16 w-px bg-border" />
        <div className="flex-1 space-y-1">
           <h3 className="text-xl font-bold tracking-tight">Testimoni Siswa</h3>
           <p className="text-sm text-muted-foreground">Apa kata mereka yang sudah belajar di kursus ini.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground italic">
            Belum ada ulasan untuk kursus ini.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-2xl border bg-card/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <img src={review.user.image} className="size-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold leading-none">{review.user.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`size-3 ${i < review.rating ? "fill-current" : ""}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
