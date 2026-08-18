"use client";

import { useEffect, useState } from "react";
import { Star, User, Edit3, Trash2, Send, X, Plus, Loader2 } from "lucide-react";
import { getCourseReviews, getCourseRatingSummary, submitReview, deleteReview } from "@/actions/reviews";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  };
};

interface CourseReviewsProps {
  courseId: string;
  isEnrolled?: boolean;
}

export function CourseReviews({ courseId, isEnrolled = false }: CourseReviewsProps) {
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "id" ? idLocale : enUS;

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState({ average: "0.0", count: 0 });
  const [loading, setLoading] = useState(true);

  // Edit / Add Review state
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
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

  useEffect(() => {
    loadData();
  }, [courseId]);

  const userReview = reviews.find((r) => r.userId === currentUserId);

  const handleOpenEdit = (existingReview?: Review) => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const result = await submitReview(courseId, rating, comment);
      if (result.success) {
        toast.success(tCommon("success"));
        setIsEditing(false);
        await loadData();
      }
    } catch (error: any) {
      toast.error(error.message || tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm(t("deleteReviewConfirm"))) return;

    try {
      await deleteReview(reviewId);
      toast.success(tCommon("success"));
      await loadData();
    } catch (error: any) {
      toast.error(error.message || tCommon("error"));
    }
  };

  if (loading) return <div className="h-40 bg-muted/40 animate-pulse rounded-2xl border" />;

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center space-y-1">
            <p className="text-5xl font-black tracking-tighter text-primary">{summary.average}</p>
            <div className="flex justify-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < Math.floor(Number(summary.average)) ? "fill-current" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              {t("reviewsCount", { count: summary.count })}
            </p>
          </div>
          <div className="h-16 w-px bg-border" />
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">{t("studentReviews")}</h3>
            <p className="text-xs text-muted-foreground">{t("studentReviewsSubtitle")}</p>
          </div>
        </div>

        {/* Action Button: Write / Edit Review */}
        {isEnrolled && (
          <div>
            {userReview ? (
              <button
                type="button"
                onClick={() => handleOpenEdit(userReview)}
                className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary hover:bg-primary/20 transition-all shadow-xs active:scale-95"
              >
                <Edit3 className="size-3.5" />
                {t("editReview")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenEdit()}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
              >
                <Plus className="size-3.5" />
                {t("writeReview")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline Review Form (Modal / Card) */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-primary/40 bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black uppercase tracking-wide text-foreground">
                {userReview ? t("editReview") : t("writeReview")}
              </h4>
              <p className="text-xs text-muted-foreground">{t("reviewExperience")}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Star Selector */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform active:scale-90"
              >
                <Star
                  className={cn(
                    "size-8 transition-colors",
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("reviewPlaceholder")}
            rows={3}
            required
            className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-hidden transition-all resize-none shadow-inner"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-black uppercase text-muted-foreground hover:bg-muted"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              {userReview ? t("updateReview") : t("submitReview")}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground italic text-sm">
            {t("noReviews")}
          </div>
        ) : (
          reviews.map((review) => {
            const isOwner = currentUserId && review.userId === currentUserId;

            return (
              <div
                key={review.id}
                className={cn(
                  "p-6 rounded-3xl border bg-card/50 space-y-4 transition-all shadow-xs relative group",
                  isOwner && "border-primary/40 bg-primary/[0.02]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {review.user.image ? (
                      <img
                        src={review.user.image}
                        className="size-9 rounded-full object-cover border"
                        alt={review.user.name}
                      />
                    ) : (
                      <div className="size-9 rounded-full bg-muted flex items-center justify-center border">
                        <User className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-foreground">{review.user.name}</p>
                        {isOwner && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {t("yourReview")}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3",
                            i < review.rating ? "fill-current" : "text-muted-foreground/20"
                          )}
                        />
                      ))}
                    </div>

                    {/* Edit & Delete Action for Owner */}
                    {isOwner && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(review)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title={t("editReview")}
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title={t("deleteReview")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed italic font-medium">
                  "{review.comment}"
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
