"use client";

import { useState } from "react";
import { toast } from "sonner";
import { enrollFreeCourse } from "@/actions/payment";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Clock, UserPlus } from "lucide-react";

type FreeEnrollButtonProps = {
  courseId: string;
  isManualApproval?: boolean;
};

export function FreeEnrollButton({ courseId, isManualApproval = false }: FreeEnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("courses");
  const tStudio = useTranslations("studio");
  const tCommon = useTranslations("common");
  const router = useRouter();

  async function handleEnroll() {
    try {
      setLoading(true);
      const res = await enrollFreeCourse(courseId);
      if (res.success) {
        if (res.isPendingApproval) {
          toast.success(tStudio("statusPendingApproval") + ": " + t("pendingApprovalBanner"));
          window.location.reload();
        } else {
          toast.success(tCommon("success"));
          if (res.redirectUrl) {
            router.push(res.redirectUrl as any);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || tCommon("error"));
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-muted border border-border px-4 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted/80 active:scale-95 disabled:opacity-50 shadow-2xs"
    >
      {loading ? (
        "..."
      ) : isManualApproval ? (
        <>
          <Clock className="size-4 text-amber-500" />
          {t("requestEnrollment")}
        </>
      ) : (
        <>
          <UserPlus className="size-4 text-primary" />
          {t("enrollFree")}
        </>
      )}
    </button>
  );
}
