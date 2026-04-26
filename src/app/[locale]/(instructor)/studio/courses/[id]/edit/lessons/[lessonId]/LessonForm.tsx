"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2, Save, Video, Clock, FileText, Globe, Languages, HelpCircle } from "lucide-react";
import { updateLesson } from "@/actions/curriculum";
import dynamic from "next/dynamic";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function LessonForm({ lesson, courseId, locale }: { lesson: any, courseId: string, locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contentId, setContentId] = useState(lesson.contentId || "");
  const [contentEn, setContentEn] = useState(lesson.contentEn || "");
  const [duration, setDuration] = useState(lesson.duration || 5);

  // Auto-calculate duration based on reading time
  useEffect(() => {
    if (lesson.type === 'article') {
      const text = contentId || contentEn || "";
      const words = text.trim().split(/\s+/).length;
      if (words > 0) {
        const calculatedMinutes = Math.max(1, Math.ceil(words / 200));
        setDuration(calculatedMinutes);
      }
    }
  }, [contentId, contentEn, lesson.type]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateLesson(courseId, lesson.id, formData);
      if (result.success) {
        toast.success("Materi berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal memperbarui materi.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-6 rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
           <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Globe className="size-4" /> Judul Materi
           </h2>
           <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bahasa Indonesia</label>
                <input 
                  name="titleId"
                  defaultValue={lesson.titleId}
                  required
                  className="w-full rounded-2xl border bg-background/50 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">English</label>
                <input 
                  name="titleEn"
                  defaultValue={lesson.titleEn}
                  required
                  className="w-full rounded-2xl border bg-background/50 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
             </div>
           </div>
        </section>

        <section className="space-y-6 rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
           <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="size-4" /> Pengaturan Tambahan
           </h2>
           <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Durasi (Menit)</label>
                    {lesson.type === 'article' && (
                      <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">Auto-calc</span>
                    )}
                 </div>
                <input 
                  name="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  required
                  className="w-full rounded-2xl border bg-background/50 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
             </div>
             <div className="flex items-center justify-between rounded-2xl border bg-background/50 p-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Akses Gratis (Preview)</label>
                <input 
                  name="isFree"
                  type="checkbox"
                  defaultChecked={lesson.isFree}
                  className="size-5 rounded-lg border-primary accent-primary cursor-pointer"
                />
             </div>
           </div>
        </section>
      </div>

      {lesson.type === 'video' && (
        <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl space-y-6">
           <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Video className="size-4" /> Video Source
           </h2>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">YouTube URL / Video ID</label>
              <input 
                name="videoUrl"
                defaultValue={lesson.videoUrl || ""}
                required
                className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              <p className="text-[10px] text-muted-foreground font-medium px-1">
                * Masukkan URL lengkap atau ID video YouTube.
              </p>
           </div>
        </section>
      )}

      {lesson.type === 'article' && (
        <section className="rounded-2xl border bg-card/50 p-8 shadow-sm space-y-6">
           <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileText className="size-4" /> Konten Artikel
           </h2>
            <div className="grid gap-10">
              {/* Bahasa Indonesia Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Languages className="size-4 text-primary" /> Bahasa Indonesia
                  </label>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter">
                    Markdown Support
                  </div>
                </div>
                <input type="hidden" name="contentId" value={contentId} />
                <div className="modern-editor-wrapper rounded-3xl border border-border/50 bg-background/30 backdrop-blur-md transition-all focus-within:border-primary/30 focus-within:shadow-2xl focus-within:shadow-primary/5">
                  <MDEditor
                    value={contentId}
                    onChange={(val) => setContentId(val || "")}
                    height={500}
                    preview="live"
                    hideToolbar={false}
                    enableScroll={true}
                    previewOptions={{ 
                      className: "prose max-w-none dark:prose-invert p-6",
                    }}
                    className="!bg-transparent !border-none !rounded-3xl"
                  />
                </div>
              </div>
              
              {/* English Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Languages className="size-4 text-primary" /> English
                  </label>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter">
                    Markdown Support
                  </div>
                </div>
                <input type="hidden" name="contentEn" value={contentEn} />
                <div className="modern-editor-wrapper rounded-3xl border border-border/50 bg-background/30 backdrop-blur-md transition-all focus-within:border-primary/30 focus-within:shadow-2xl focus-within:shadow-primary/5">
                  <MDEditor
                    value={contentEn}
                    onChange={(val) => setContentEn(val || "")}
                    height={500}
                    preview="live"
                    hideToolbar={false}
                    enableScroll={true}
                    previewOptions={{ 
                      className: "prose max-w-none dark:prose-invert p-6",
                    }}
                    className="!bg-transparent !border-none !rounded-3xl"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="rounded-full bg-primary/20 p-2 text-primary mt-0.5">
                  <FileText className="size-3" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                  Gunakan Markdown Editor untuk format teks, gambar, dan kode secara real-time. 
                  Tombol <strong className="text-foreground">Full Screen</strong> tersedia di pojok kanan atas toolbar editor untuk pengalaman menulis yang lebih fokus.
                  Jika salah satu bahasa dikosongkan, materi akan tetap muncul menggunakan bahasa lainnya sebagai fallback.
                </p>
              </div>
            </div>
        </section>
      )}

      {lesson.type === 'quiz' && (
        <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl space-y-8">
           <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="rounded-full bg-amber-500/10 p-10 text-amber-500">
                 <HelpCircle className="size-20" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black">Quiz Builder</h2>
                 <p className="text-muted-foreground max-w-sm">Kelola pertanyaan, pilihan jawaban, dan kunci jawaban untuk kuis ini.</p>
              </div>
              <Link 
                href={`/${locale}/studio/courses/${courseId}/edit/lessons/${lesson.id}/quiz`}
                className="rounded-2xl bg-amber-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-amber-500/20 hover:opacity-90"
              >
                Buka Quiz Builder
              </Link>
           </div>
        </section>
      )}

      <div className="sticky bottom-8 flex justify-center z-10">
        <button 
          type="submit"
          disabled={loading}
          className="flex items-center gap-3 rounded-full bg-slate-900 dark:bg-slate-100 px-10 py-5 text-sm font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <Save className="size-5" />
              Simpan Materi
            </>
          )}
        </button>
      </div>
    </form>
  );
}
