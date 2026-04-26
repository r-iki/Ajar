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
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");

  // Initialize form data when session is available
  useState(() => {
    if (session) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
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
        email: email !== session.user.email ? email : undefined,
      });
      toast.success("Profil berhasil diperbarui!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: window.location.href,
      });
      toast.success("Link verifikasi telah dikirim ke email Anda.");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim email verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Pengaturan Akun
        </h1>
        <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda.</p>
      </header>

      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <div className="relative group mx-auto size-48 overflow-hidden rounded-2xl border-8 border-muted shadow-2xl transition-transform hover:scale-105">
            {image ? (
              <img src={image} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="size-20 text-muted-foreground/40" />
              </div>
            )}
            <button className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="text-white size-8" />
            </button>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xl font-black">{session.user.name}</p>
            <div className="flex items-center justify-center gap-1.5">
               <p className="text-xs text-muted-foreground font-medium">{session.user.email}</p>
               {session.user.emailVerified ? (
                 <CheckCircle2 className="size-3 text-emerald-500" />
               ) : (
                 <XCircle className="size-3 text-amber-500" />
               )}
            </div>
            <p className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
               {session.user.role}
            </p>
          </div>
        </aside>

        <main className="space-y-8">
          <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight">Informasi Profil</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border bg-background/50 pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                    placeholder="Nama Anda"
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border bg-background/50 pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                {!session.user.emailVerified && (
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-1">
                    * Email belum diverifikasi. <button type="button" onClick={handleVerifyEmail} className="underline hover:text-amber-700">Kirim link verifikasi</button>
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL Avatar</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full rounded-2xl border bg-background/50 pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-2xl bg-slate-900 dark:bg-slate-100 px-8 py-4 text-xs font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/10"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight">Keamanan</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-muted/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Status Verifikasi</p>
                    <p className="text-xs text-muted-foreground">Keamanan akun dan akses sertifikat.</p>
                  </div>
                </div>
                {session.user.emailVerified ? (
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <CheckCircle2 className="size-4" />
                    Verified
                  </div>
                ) : (
                  <button 
                    onClick={handleVerifyEmail}
                    className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                  >
                    Unverified • Verify Now
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
