"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2, Globe, Languages } from "lucide-react";
import { createCourse, createCategory } from "@/actions/course";
import { Plus, X } from "lucide-react";

export function CreateCourseForm({ categories: initialCategories, locale }: { categories: any[], locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatLoading, setNewCatLoading] = useState(false);

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
    
    try {
      const result = await createCourse(formData);
      if (result.success) {
        toast.success("Kursus berhasil dibuat!");
        router.push(`/studio/courses/${result.courseId}/edit`);
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
              <h3 className="text-lg font-black tracking-tight">Tambah Kategori Baru</h3>
              <button type="button" onClick={() => setShowNewCategory(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama (Indonesia)</label>
                <input name="nameId" required className="w-full rounded-xl border bg-background px-4 py-3 text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name (English)</label>
                <input name="nameEn" required className="w-full rounded-xl border bg-background px-4 py-3 text-sm font-medium" />
              </div>
              <button 
                type="submit" 
                disabled={newCatLoading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground disabled:opacity-50"
              >
                {newCatLoading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Simpan Kategori"}
              </button>
            </div>
          </form>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Globe className="size-3" /> Judul (Indonesia)
            </label>
            <input 
              name="titleId"
              required
              className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
              placeholder="Contoh: Belajar Next.js dari Dasar"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Languages className="size-3" /> Title (English)
            </label>
            <input 
              name="titleEn"
              required
              className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
              placeholder="Example: Learning Next.js for Beginners"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deskripsi Singkat (Indonesia)</label>
          <textarea 
            name="descId"
            required
            rows={3}
            className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all resize-none"
            placeholder="Jelaskan apa yang akan dipelajari dalam Bahasa Indonesia..."
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Short Description (English)</label>
          <textarea 
            name="descEn"
            required
            rows={3}
            className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all resize-none"
            placeholder="Explain the learning objectives in English..."
          />
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kategori</label>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewCategory(true)}
                  className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="size-3" /> Tambah Baru
                </button>
                <Link 
                  href="/studio/categories"
                  className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground hover:underline"
                >
                  Kelola
                </Link>
              </div>
            </div>
            <select 
              name="categoryId"
              required
              className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all appearance-none cursor-pointer"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'id' ? cat.nameId : cat.nameEn}
                </option>
              ))}
            </select>
          </div>
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Level</label>
          <select 
            name="level"
            required
            className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all appearance-none cursor-pointer"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 dark:bg-slate-100 py-4 text-sm font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/10"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
             <Loader2 className="size-4 animate-spin" /> Membuat...
          </div>
        ) : "Buat Kursus & Lanjut ke Kurikulum"}
      </button>
    </form>
  </div>
  );
}
