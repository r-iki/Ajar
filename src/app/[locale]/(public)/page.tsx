import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { getCourses } from "@/actions/course";
import { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Code2, Globe, Sparkles, Trophy, Zap, BookOpen, ShieldCheck, CheckCircle2 } from "lucide-react";
import { tDb } from "@/lib/i18n/db-helper";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: `${t("headline")} | ${process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar"}`,
    description: t("description"),
  };
}

const ABSTRACT_PLACEHOLDER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";

export default async function LandingPage() {
  const t = await getTranslations("home");
  const tCourses = await getTranslations("courses");
  const locale = await getLocale();
  const session = await getSession();
  const featuredCourses = await getCourses();

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative pt-12">
        <div className="hero-grid-bg" />
        
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-sm">
              <Sparkles className="size-3" />
              {t("badge")}
            </div>
            
            <h1 className="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl bg-linear-to-b from-foreground to-foreground/50 bg-clip-text text-transparent leading-[1.1]">
              {t("headline")}
            </h1>
            
            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed font-medium">
              {t("description")}
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
                {session ? t("openDashboard") : t("ctaStart")}
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
                  {t("trustedBy", { count: "2,000+" })}
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

      {/* Featured Courses Showcase Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
              <BookOpen className="size-3" />
              {t("productCatalog")}
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase lg:text-4xl">{t("featuredCoursesTitle")}</h2>
            <p className="text-muted-foreground font-medium max-w-xl text-sm md:text-base">
              {t("featuredCoursesSubtitle")}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline group"
          >
            {t("viewAllCourses")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-[2.5rem] border-2 border-dashed bg-card/50">
            <BookOpen className="size-12 text-muted-foreground/30" />
            <p className="text-lg font-bold text-muted-foreground">{t("noCoursesPublished")}</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.slice(0, 3).map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                <article className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                    <Image 
                      src={course.thumbnail || ABSTRACT_PLACEHOLDER} 
                      alt={tDb(course.title, locale)} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary shadow-lg">
                        {course.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col p-8">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-lg">
                        {course.category ? tDb(course.category.name, locale) : "Digital Skill"}
                      </span>
                    </div>
                    
                    <h3 className="line-clamp-2 text-xl font-black leading-tight group-hover:text-primary transition-colors mb-6 min-h-[3.5rem]">
                      {tDb(course.title, locale)}
                    </h3>

                    <div className="space-y-2 mb-6 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{t("lifetimeAccessFeature")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{t("digitalCertFeature")}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-dashed pt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("priceInvestment")}</span>
                        <span className="text-xl font-black text-primary">
                          {course.price === "0" ? tCourses("free") : `IDR ${Number(course.price).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:scale-110">
                        <ArrowRight className="size-5" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* DOKU Merchant Banner */}
        <div className="rounded-[2.5rem] border bg-gradient-to-r from-primary/10 via-card to-card p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
              <ShieldCheck className="size-4 text-emerald-500" />
              {t("paymentSecureBadge")}
            </div>
            <h3 className="text-xl font-black">{t("paymentSecureTitle")}</h3>
            <p className="text-xs text-muted-foreground font-medium max-w-lg">
              {t("paymentSecureDesc")}
            </p>
          </div>
          <Link
            href="/courses"
            className="shrink-0 rounded-2xl bg-foreground px-6 py-3.5 text-xs font-black text-background transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {t("startLearningNow")}
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-16">
         <div className="text-center space-y-4">
            <h2 className="text-3xl font-black tracking-tight uppercase lg:text-5xl">{t("whyAjar")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">{t("whyAjarSubtitle")}</p>
         </div>

         <div className="grid gap-8 md:grid-cols-3">
            {[
               { icon: Globe, title: t("dualLangTitle"), desc: t("dualLangDesc") },
               { icon: Code2, title: t("realProjectsTitle"), desc: t("realProjectsDesc") },
               { icon: Zap, title: t("xpGamificationTitle"), desc: t("xpGamificationDesc") },
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
