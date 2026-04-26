"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, ShieldCheck, Camera, CheckCircle2, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  // Initialize form data when session is available
  useState(() => {
    if (session) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  });

  if (isPending) return <div className="flex h-96 items-center justify-center">Loading...</div>;
  if (!session) {
    router.push("/sign-in");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.updateUser({
        name,
        image,
      });
      toast.success("Profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    toast.info("Fitur verifikasi email sedang disiapkan.");
    // In real app: await authClient.sendVerificationEmail();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Pengaturan Akun</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        <aside className="space-y-4">
          <div className="relative group mx-auto size-40 overflow-hidden rounded-full border-4 border-muted shadow-inner">
            {image ? (
              <img src={image} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="size-16 text-muted-foreground/40" />
              </div>
            )}
            <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-bold">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-3xl border glass p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Informasi Dasar</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-2"
                  placeholder="Nama Anda"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">URL Avatar</label>
                <input 
                  type="text" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-2"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border glass p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Keamanan & Verifikasi</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Email</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                {session.user.emailVerified ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                    <CheckCircle2 className="size-4" />
                    Terverifikasi
                  </div>
                ) : (
                  <button 
                    onClick={handleVerifyEmail}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Verifikasi Sekarang
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Status Akun</p>
                    <p className="text-xs text-muted-foreground">Verifikasi identitas untuk fitur premium.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <XCircle className="size-4" />
                  Belum Verifikasi
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
