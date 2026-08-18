"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, Globe, ShieldCheck, AlertTriangle } from "lucide-react";
import { updateCourseSettings, deleteCourse } from "@/actions/course";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useTranslations } from "next-intl";

export function SettingsForm({ course, locale }: { course: any, locale: string }) {
  const router = useRouter();
  const t = useTranslations("studio");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState(course.enrollmentType || "public");

  const enrollmentOptions = [
    { value: "public", label: t("enrollmentPublic") },
    { value: "manual", label: t("enrollmentManual") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("enrollmentType", enrollmentType);
    
    try {
      const result = await updateCourseSettings(course.id, formData);
      if (result.success) {
        toast.success(tCommon("success"));
        router.refresh();
      } else {
        toast.error(result.error || tCommon("error"));
      }
    } catch (error) {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    setDeleteLoading(true);
    try {
      const result = await deleteCourse(course.id);
      if (result.success) {
        toast.success(tCommon("success"));
        router.push("/studio/courses" as any);
      } else {
        toast.error(result.error || tCommon("error"));
      }
    } catch (error) {
      toast.error(tCommon("error"));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Globe className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{t("seoSettings")}</h2>
              <p className="text-xs text-muted-foreground font-medium">{t("seoSubtitle")}</p>
            </div>
          </div>

          <div className="grid gap-6 rounded-2xl border bg-card/50 p-6 shadow-sm backdrop-blur-xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom URL (Slug)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-3 rounded-xl border">/courses/</span>
                <input 
                  name="slug"
                  defaultValue={course.slug}
                  required
                  className="flex-1 rounded-xl border bg-background/50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium px-1">
                {t("slugWarning")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("metaDescription")}</label>
              <textarea 
                name="metaDescription"
                defaultValue={course.metaDescription || ""}
                placeholder={t("metaPlaceholder")}
                rows={3}
                className="w-full rounded-xl border bg-background/50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all resize-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2">
              <ShieldCheck className="size-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{t("enrollmentAccess")}</h2>
              <p className="text-xs text-muted-foreground font-medium">{t("enrollmentSubtitle")}</p>
            </div>
          </div>

          <div className="grid gap-6 rounded-2xl border bg-card/50 p-6 shadow-sm backdrop-blur-xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("enrollmentMethod")}</label>
              <CustomSelect
                name="enrollmentType"
                value={enrollmentType}
                onChange={setEnrollmentType}
                options={enrollmentOptions}
              />
              <p className="text-[10px] text-muted-foreground font-medium px-1">
                {t("enrollmentHint")}
              </p>
            </div>
          </div>
        </section>

        <button 
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-slate-900 dark:bg-slate-100 py-4 text-sm font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/10"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
               <Loader2 className="size-4 animate-spin" /> {tCommon("saving")}
            </div>
          ) : t("saveChanges")}
        </button>
      </form>

      <div className="border-t pt-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-2">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-red-600">{t("dangerZone")}</h2>
              <p className="text-xs text-muted-foreground font-medium">{t("dangerSubtitle")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800 dark:text-red-400">{t("deleteCourseTitle")}</h3>
              <p className="text-xs text-red-700/70 dark:text-red-400/70">
                {t("deleteCourseDesc")}
              </p>
            </div>
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
            >
              {deleteLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {t("deleteCourseBtn")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
