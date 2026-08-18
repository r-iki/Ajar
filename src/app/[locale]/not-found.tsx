import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { 
  Home, 
  BookOpen, 
  ArrowLeft, 
  Trophy, 
  LayoutDashboard, 
  Compass,
  Sparkles 
} from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main 404 Hero Container */}
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Brand & Error Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative p-2 rounded-2xl bg-card border border-border shadow-xl shadow-primary/5 hover:scale-105 transition-transform">
            <Image 
              src="/favicon.jpg" 
              alt="Ajar Brand Logo" 
              width={48} 
              height={48} 
              className="rounded-xl object-cover"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
            <Compass className="size-3.5 animate-spin duration-3000" />
            <span>{t("badge")}</span>
          </div>
        </div>

        {/* Big 404 Numbers with Gradient */}
        <div className="relative select-none my-2">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-foreground via-foreground/70 to-foreground/30 bg-clip-text text-transparent leading-none drop-shadow-sm">
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary/40 rounded-full blur-xs" />
        </div>

        {/* Headline & Description */}
        <div className="space-y-3 max-w-lg">
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            {t("headline")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {t("description")}
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 w-full max-w-md">
          <Link
            href="/"
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Home className="size-4" />
            <span>{t("ctaHome")}</span>
          </Link>

          <Link
            href="/courses"
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground text-xs font-black uppercase tracking-wider shadow-sm hover:bg-muted hover:border-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <BookOpen className="size-4 text-primary" />
            <span>{t("ctaCourses")}</span>
          </Link>
        </div>

        {/* Browser Back Button */}
        <BackButton />

        {/* Quick Recommended Links */}
        <div className="pt-8 border-t border-border/60 w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {t("quickLinks")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Katalog Kursus", href: "/courses", icon: BookOpen },
              { label: "Papan Peringkat", href: "/leaderboard", icon: Trophy },
              { label: "Dashboard Belajar", href: "/dashboard", icon: LayoutDashboard },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted/50 border border-border/50 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <link.icon className="size-3 text-primary" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
