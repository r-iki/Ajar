"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user";
import { User, Mail, Camera, Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      toast.success("Profil berhasil diperbarui!");
      setTimeout(() => setSuccess(false), 3000);
    } else {
      toast.error(result.error || "Gagal memperbarui profil.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Avatar Section */}
        <div className="group relative mx-auto shrink-0 md:mx-0">
          <div className="relative size-32 overflow-hidden rounded-[2.5rem] border-4 border-background bg-muted shadow-2xl shadow-primary/20">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <User className="size-12" />
              </div>
            )}
          </div>
          <button 
            type="button"
            className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <Camera className="size-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="name"
                  type="text"
                  defaultValue={user.name}
                  required
                  className="w-full rounded-2xl border bg-card/50 py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email (Tetap)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-2xl border bg-muted py-3 pl-11 pr-4 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL Foto Profil</label>
            <input
              name="image"
              type="text"
              defaultValue={user.image}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-2xl border bg-card/50 py-3 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
            <p className="text-[10px] text-muted-foreground font-medium">Gunakan link gambar eksternal (Unsplash, Cloudinary, dsb) untuk saat ini.</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              {loading ? "MENYIMPAN..." : success ? "BERHASIL!" : "SIMPAN PERUBAHAN"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
