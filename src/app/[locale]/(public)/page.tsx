import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Metadata } from "next";

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
    <section className="grid gap-8 py-12 md:grid-cols-[1.2fr_1fr] md:items-center">
      <div className="space-y-5">
        <p className="inline-flex rounded-full border bg-card px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Advanced Coding Platform • v2.0
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl bg-linear-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent leading-tight">
          {t("headline")}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link 
            href="/courses" 
            className="rounded-xl bg-slate-900 dark:bg-slate-100 px-8 py-4 text-sm font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-primary/10"
          >
            {t("ctaExplore")}
          </Link>
          <Link 
            href={session ? "/dashboard" : "/sign-up"} 
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-card px-8 py-4 text-sm font-black transition-all hover:bg-muted active:scale-95"
          >
            {session ? "Buka Dashboard" : t("ctaStart")}
          </Link>
        </div>
      </div>
      <div className="group relative rounded-2xl border bg-card p-10 transition-all hover:shadow-2xl hover:shadow-primary/5">
        <div className="absolute -top-4 -right-4 size-24 rounded-full bg-primary/10 blur-3xl" />
        <h2 className="text-xl font-black tracking-tight uppercase">Tech Stack & Progress</h2>
        <div className="mt-6 space-y-4">
          {[
            { label: "Bilingual Engine (ID/EN)", done: true },
            { label: "Dynamic Dashboard & Progress", done: true },
            { label: "Certificate Generation (PDF)", done: true },
            { label: "Drizzle + Cloudflare D1 Stack", done: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-1 text-emerald-500">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
