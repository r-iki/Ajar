"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { createCourse, createCategory } from "@/actions/course";
import { MultiLangInput } from "@/components/studio/MultiLangInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { tDb } from "@/lib/i18n/db-helper";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function CreateCourseForm({ categories: initialCategories, locale }: { categories: any[], locale: string }) {
  const router = useRouter();
  const t = useTranslations("studio");
  const tCourses = useTranslations("courses");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatLoading, setNewCatLoading] = useState(false);
  const [level, setLevel] = useState("beginner");
  const [categoryId, setCategoryId] = useState("");

  const levelOptions = [
    { id: "beginner", label: tCourses("levelBeginner"), icon: "🌱" },
    { id: "intermediate", label: tCourses("levelIntermediate"), icon: "⚡" },
    { id: "advanced", label: tCourses("levelAdvanced"), icon: "🔥" },
  ];

  const categoryOptions = [
    { value: "", label: tCourses("categoryAll") },
    ...categories.map((cat) => ({
      value: cat.id,
      label: tDb(cat.name, locale),
    })),
  ];

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewCatLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createCategory(formData);
      if (result.success) {
        toast.success("Kategori baru ditambahkan!");
        setShowNewCategory(false);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal membuat kategori.");
      }
    } catch (error) {
      toast.error("Error sistem.");
    } finally {
      setNewCatLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("level", level);
    formData.set("categoryId", categoryId);
    
    try {
      const result = await createCourse(formData);
      if (result.success) {
        toast.success("Kursus berhasil dibuat!");
        router.push(`/studio/courses/${result.courseId}/edit` as any);
      } else {
        toast.error(result.error || "Gagal membuat kursus.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {showNewCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-foreground">
          <form 
            onSubmit={handleCreateCategory}
            className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight">{t("manageCategories")}</h3>
              <button type="button" onClick={() => setShowNewCategory(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <MultiLangInput 
                label={t("category")}
                namePrefix="name"
                required
                placeholder="Web Development, UI/UX, AI..."
              />
              <button 
                type="submit" 
                disabled={newCatLoading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground disabled:opacity-50 shadow-md shadow-primary/20"
              >
                {newCatLoading ? <Loader2 className="size-4 animate-spin mx-auto" /> : t("saveChanges")}
              </button>
            </div>
          </form>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <MultiLangInput 
          label={t("courseTitle")}
          namePrefix="title"
          required
          placeholder="Next.js, Python, TypeScript..."
        />

        <MultiLangInput 
          label={t("courseDesc")}
          namePrefix="desc"
          type="textarea"
          required
          rows={3}
          placeholder="Jelaskan apa yang akan dipelajari..."
        />

        <div className="grid gap-8 sm:grid-cols-2 items-start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("category")}</label>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewCategory(true)}
                  className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="size-3" /> + Tambah
                </button>
                <Link 
                  href="/studio/categories"
                  className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground hover:underline"
                >
                  {t("manageCategories")}
                </Link>
              </div>
            </div>
            <CustomSelect
              name="categoryId"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              placeholder={tCourses("categoryAll")}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("level")}</label>
            <div className="grid grid-cols-3 gap-2">
              {levelOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLevel(opt.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-black transition-all gap-1 shadow-2xs",
                    level === opt.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="text-[11px] truncate max-w-full">{opt.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="level" value={level} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
               <Loader2 className="size-4 animate-spin" /> {t("saveChanges")}...
            </div>
          ) : `${t("newCourse")} & ${t("curriculum")}`}
        </button>
      </form>
    </div>
  );
}
