import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Award, Share2, ExternalLink, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SectionTabBar from "@/components/layout/SectionTabBar";
import { tDb } from "@/lib/i18n/db-helper";

export default async function CertificatesPage() {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  const certificates = await db.query.certificates.findMany({
    where: (c, { eq }) => eq(c.userId, session.user.id),
    with: {
      course: true,
    },
    orderBy: (c, { desc }) => [desc(c.issuedAt)],
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <Award size={16} />
           <span className="text-xs font-black uppercase tracking-widest">{t("earnedCertificates")}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">{t("certificates")}</h1>
        <p className="text-muted-foreground font-medium">{t("earnedCertificates")}</p>
      </header>

      <SectionTabBar tabs={[
        { label: tNav("myCourses"), href: "/my-courses" },
        { label: tNav("certificates"), href: "/certificates" },
        { label: tNav("leaderboard"), href: "/leaderboard" },
      ]} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 group hover:border-purple-500/30 transition-all shadow-sm">
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform">
            <Award size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground">{certificates.length}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("totalCertificatesCount")}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground">{new Set(certificates.map(c => c.courseId)).size}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("coursesCompletedCount")}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
            <Share2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground">0</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("sharedCount")}</span>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 backdrop-blur-sm group hover:border-primary/40 transition-all relative overflow-hidden shadow-sm">
              {/* Decorative */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 blur-[60px] group-hover:bg-primary/10 transition-all" />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                  <Award size={32} />
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest rounded-full">
                  Verified
                </span>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <h3 className="text-lg font-black text-foreground leading-snug">
                  {tDb(cert.course.title, locale)}
                </h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {t("issuedDate", { date: new Date(cert.issuedAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) })}
                </p>
                <div className="mt-1 px-3 py-2 bg-muted/50 rounded-xl border border-border">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t("certCode")}</p>
                  <p className="text-xs font-bold text-foreground font-mono">{cert.code}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <a
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(tDb(cert.course.title, locale))}&organizationName=${encodeURIComponent(process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar")}&certUrl=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${locale}/v/${cert.code}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600/20 transition-all"
                >
                  <Share2 size={14} />
                  {t("shareLinkedIn")}
                </a>
                <Link
                  href={`/v/${cert.code}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted border border-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-muted/80 transition-all"
                >
                  <ExternalLink size={14} />
                  {t("verifyCert")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-[3rem] gap-6">
          <div className="p-8 bg-muted rounded-full border border-border text-muted-foreground">
            <Award size={48} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-black text-foreground uppercase tracking-widest">{t("noCertsTitle")}</p>
            <p className="text-sm text-muted-foreground max-w-sm">{t("noCertsDesc")}</p>
          </div>
          <Link href="/my-courses" className="px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-md">
            {t("viewMyCoursesBtn")}
          </Link>
        </div>
      )}
    </div>
  );
}

