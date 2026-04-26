import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Code2, Globe, Sparkles, Trophy, Zap } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: `${t("headline")} | Ajar`,
    description: t("description"),
  };
}

export default async function LandingPage() {
  const t = await getTranslations("home");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative pt-12">
        <div className="hero-grid-bg" />
        
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-sm">
              <Sparkles className="size-3" />
              Revolutionizing Tech Learning
            </div>
            
            <h1 className="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl bg-linear-to-b from-foreground to-foreground/50 bg-clip-text text-transparent leading-[1.1]">
              {t("headline")}
            </h1>
            
            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed font-medium">
              {t("description")} Platform pembelajaran IT dengan kurikulum industri, proyek riil, dan sistem XP yang seru.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/courses" 
                className="group flex items-center gap-2 rounded-2xl bg-primary px-10 py-5 text-sm font-black text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95"
              >
                {t("ctaExplore")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href={session ? "/dashboard" : "/sign-up"} 
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card px-10 py-5 text-sm font-black transition-all hover:bg-muted active:scale-95 shadow-lg"
              >
                {session ? "Buka Dashboard" : t("ctaStart")}
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-dashed">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="size-10 rounded-full border-2 border-background bg-muted overflow-hidden ring-2 ring-primary/5">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                     </div>
                  ))}
               </div>
               <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  DIPERCAYA OLEH <span className="text-foreground">2,000+</span> SISWA
               </p>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
            <div className="relative overflow-hidden rounded-[3rem] border-8 border-background bg-muted shadow-2xl">
              <Image 
                src="/hero.png" 
                alt="Ajar Hero" 
                width={800}
                height={600}
                priority
                className="object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -left-6 rounded-3xl bg-card p-6 shadow-2xl border animate-bounce duration-[3000ms]">
               <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                     <Trophy className="size-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Highest Rating</p>
                     <p className="text-xl font-black">4.9 / 5.0</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-16">
         <div className="text-center space-y-4">
            <h2 className="text-3xl font-black tracking-tight uppercase lg:text-5xl">Mengapa Belajar di Ajar?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">Fitur terbaik untuk mendukung karir IT Anda.</p>
         </div>

         <div className="grid gap-8 md:grid-cols-3">
            {[
               { icon: Globe, title: "Dual Language", desc: "Tersedia dalam Bahasa Indonesia & English untuk menjangkau standar global." },
               { icon: Code2, title: "Proyek Riil", desc: "Bangun portofolio nyata yang bisa dipamerkan ke calon perusahaan." },
               { icon: Zap, title: "XP & Gamifikasi", desc: "Sistem reward yang memotivasi Anda untuk konsisten belajar setiap hari." },
            ].map((feature, i) => (
               <div key={i} className="group rounded-[2.5rem] border bg-card p-10 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                  <div className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                     <feature.icon className="size-8" />
                  </div>
                  <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
               </div>
            ))}
         </div>
      </section>
    </div>
  );
}

