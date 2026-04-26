import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/user/ProfileForm";
import { Settings, Shield, Bell, Zap, LogOut } from "lucide-react";
import { getLocale } from "next-intl/server";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Pengaturan Akun</h1>
        <p className="text-muted-foreground font-medium">Kelola informasi pribadi dan preferensi aplikasi Anda.</p>
      </header>

      <div className="grid gap-12 md:grid-cols-[240px_1fr]">
        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-2">
          {[
            { label: "Profil Umum", icon: Settings, active: true },
            { label: "Keamanan", icon: Shield, active: false },
            { label: "Notifikasi", icon: Bell, active: false },
            { label: "Gamifikasi", icon: Zap, active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                item.active 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
          <div className="mt-8 pt-8 border-t">
             <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-all">
                <LogOut className="size-4" />
                Keluar Sesi
             </button>
          </div>
        </nav>

        {/* Content Section */}
        <div className="space-y-12">
           <section className="space-y-8 rounded-[3rem] border bg-card/50 p-10 backdrop-blur-sm">
              <div className="space-y-1">
                 <h2 className="text-xl font-black">Informasi Profil</h2>
                 <p className="text-sm text-muted-foreground">Ini adalah bagaimana orang lain akan melihat Anda di platform.</p>
              </div>
              <ProfileForm user={session.user} />
           </section>

           {/* More sections can be added here (e.g., Security, UI Settings) */}
        </div>
      </div>
    </div>
  );
}
