"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Upload, Trash2, Link as LinkIcon, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { updateCourseThumbnail } from "@/actions/course";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface CourseThumbnailUploaderProps {
  courseId: string;
  currentThumbnail?: string | null;
}

export function CourseThumbnailUploader({
  courseId,
  currentThumbnail,
}: CourseThumbnailUploaderProps) {
  const router = useRouter();
  const t = useTranslations("studio");
  const tCommon = useTranslations("common");

  const [thumbnail, setThumbnail] = useState<string | null>(currentThumbnail || null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setUploading(true);
    try {
      // 1. Get presigned URL from API
      const res = await fetch("/api/r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "courses",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || tCommon("error"));
      }

      const { url, publicUrl } = await res.json();

      // 2. Upload file directly to R2
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah file ke penyimpanan.");
      }

      // 3. Save thumbnail URL to course
      const updateRes = await updateCourseThumbnail(courseId, publicUrl);
      if (!updateRes.success) {
        throw new Error(updateRes.error || "Gagal menyimpan thumbnail kursus.");
      }

      setThumbnail(publicUrl);
      toast.success(tCommon("success"));
      router.refresh();
    } catch (error: any) {
      console.error("Thumbnail upload error:", error);
      toast.error(error.message || tCommon("error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setUploading(true);
    try {
      const updateRes = await updateCourseThumbnail(courseId, customUrl.trim());
      if (!updateRes.success) {
        throw new Error(updateRes.error || "Gagal menyimpan thumbnail kursus.");
      }

      setThumbnail(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl("");
      toast.success(tCommon("success"));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || tCommon("error"));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveThumbnail = async () => {
    setUploading(true);
    try {
      const updateRes = await updateCourseThumbnail(courseId, null);
      if (!updateRes.success) {
        throw new Error(updateRes.error || "Gagal menghapus thumbnail.");
      }

      setThumbnail(null);
      toast.success(tCommon("success"));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || tCommon("error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ImageIcon className="size-4 text-primary" /> Thumbnail
        </h3>
        {thumbnail && (
          <button
            type="button"
            onClick={handleRemoveThumbnail}
            disabled={uploading}
            className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="size-3" /> Hapus
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Main Thumbnail Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className={cn(
          "aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative group transition-all shadow-inner",
          dragOver ? "border-primary bg-primary/10" : "border-border/80 bg-muted/20",
          !thumbnail && "hover:border-primary/50"
        )}
      >
        {thumbnail ? (
          <>
            <img src={thumbnail} alt="Course Thumbnail" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase text-slate-900 shadow-xl hover:bg-slate-100 transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Upload className="size-3.5" /> {t("changeImage")}
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                disabled={uploading}
                className="rounded-xl bg-slate-900/90 border border-slate-700 px-3.5 py-2.5 text-[10px] font-black uppercase text-white shadow-xl hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <LinkIcon className="size-3.5" /> URL
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all">
              <Upload className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-foreground">{t("noThumbnail")}</p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Tarik & lepas gambar ke sini, atau klik untuk memilih file
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-xl bg-primary px-4 py-2 text-[10px] font-black uppercase text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-transform active:scale-95"
              >
                {t("changeImage")}
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                disabled={uploading}
                className="rounded-xl bg-muted border border-border px-3 py-2 text-[10px] font-black uppercase text-foreground hover:bg-muted/80 transition-transform active:scale-95"
              >
                URL
              </button>
            </div>
          </div>
        )}

        {/* Uploading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
              Mengunggah...
            </span>
          </div>
        )}
      </div>

      {/* URL Input Modal / Box */}
      {showUrlInput && (
        <form onSubmit={handleSaveCustomUrl} className="mt-4 p-4 rounded-2xl border border-border bg-muted/40 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <LinkIcon className="size-3 text-primary" /> Masukkan Link Gambar
            </span>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            required
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-muted-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading || !customUrl.trim()}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase shadow-xs hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
            >
              {uploading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Simpan
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-[10px] font-medium text-muted-foreground leading-relaxed">
        {t("thumbnailHint")}
      </p>
    </section>
  );
}
