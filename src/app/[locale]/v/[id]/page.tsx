import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { certificates, courses, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { CheckCircle, BookOpen, User, ShieldCheck, Clock } from "lucide-react";
import { CertificateActions } from "@/components/certificate/CertificateActions";
import Image from "next/image";
import Link from "next/link";
import { tDb } from "@/lib/i18n/db-helper";
import { getTranslations } from "next-intl/server";

interface DrizzleCallback {
    and: (...args: any[]) => any;
    eq: (...args: any[]) => any;
    inArray: (...args: any[]) => any;
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string, locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("certificate");
  
  const session = await getSession();
 
  let cert = await db.query.certificates.findFirst({
    where: or(eq(certificates.id, id), eq(certificates.code, id)),
  });
 
  if (!cert && session?.user) {
    const courseData = await db.query.courses.findFirst({
      where: or(eq(courses.id, id), eq(courses.slug, id)),
      with: {
        modules: { with: { lessons: true } },
      },
    });

    if (courseData) {
      // 1. Check if user already has a certificate for this course
      cert = await db.query.certificates.findFirst({
        where: (certs: any, { and, eq }: DrizzleCallback) =>
          and(eq(certs.courseId, courseData.id), eq(certs.userId, session.user.id)),
      });

      // 2. If not found, issue one only if the course is truly finished
      if (!cert) {
        const allLessonIds = courseData.modules.flatMap((m: any) => m.lessons.map((l: any) => l.id));
        const completedRows = await db.query.lessonProgress.findMany({
          where: (progress: any, { and, eq, inArray }: DrizzleCallback) =>
            and(eq(progress.userId, session.user.id), inArray(progress.lessonId, allLessonIds)),
        });

        const isFinished = completedRows.length === allLessonIds.length && allLessonIds.length > 0;

        if (isFinished) {
          const newCertId = crypto.randomUUID();
          const certCode = `AJR-${newCertId.split('-')[0].toUpperCase()}`;

          try {
            await db.insert(certificates).values({
              id: newCertId,
              userId: session.user.id,
              courseId: courseData.id,
              code: certCode,
              issuedAt: new Date(),
            });
            cert = await db.query.certificates.findFirst({ where: eq(certificates.id, newCertId) });
          } catch {
            // Race condition fallback
            cert = await db.query.certificates.findFirst({
              where: (certs: any, { and, eq }: DrizzleCallback) =>
                and(eq(certs.courseId, courseData.id), eq(certs.userId, session.user.id)),
            });
          }
        }
      }
    }
  }
 
  if (!cert) return notFound();
 
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, cert.courseId),
    with: {
        modules: {
            with: {
                lessons: true
            }
        }
    }
  });
 
  const certUser = await db.query.users.findFirst({
    where: eq(users.id, cert.userId),
  });

  if (!course || !certUser) return notFound();

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  const expiryDate = new Date(cert.issuedAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);
  const formattedExpiry = expiryDate.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${appUrl}/${locale}/v/${cert.code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;

  const totalDuration = course.modules.reduce((acc: number, m: any) => {
    const moduleM = m as { lessons: Array<{ duration: number | null }> };
    return acc + moduleM.lessons.reduce((lAcc: number, l: any) => lAcc + (l.duration || 0), 0);
  }, 0);

  const formatMinutes = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) return `${t("hours", { h: hrs })} ${t("minutes", { m })}`;
    return t("minutes", { m });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <div className="bg-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
               <ShieldCheck className="size-4" />
               {t("verified")}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t("completionTitle")}</h1>
            <p className="text-slate-400 max-w-xl">
               {t("congrats", { name: certUser.name, course: tDb(course.title, locale) })}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t("certId")}</span>
                    <span className="font-mono text-sm text-blue-400">{cert.code}</span>
                </div>
                <div className="flex flex-col border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t("issuedOn")}</span>
                    <span className="text-sm font-bold">{issuedDate}</span>
                </div>
                <div className="flex flex-col border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t("totalDuration")}</span>
                    <span className="text-sm font-bold">{formatMinutes(totalDuration)}</span>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
             <CertificateActions
                 certId={cert.id}
                 courseName={tDb(course.title, locale)}
                 userName={certUser.name}
             />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 space-y-8">
        <div 
          className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
        >
            <div className="p-4 sm:p-8 md:p-12 relative">
               <div className="relative w-full aspect-[1.414/1] bg-white text-slate-900 border-[8px] sm:border-[16px] border-slate-900 p-4 sm:p-8 flex flex-col items-center justify-between text-center shadow-inner">
                  <div className="absolute top-0 left-0 size-20 sm:size-32 bg-slate-900 rotate-45 -translate-x-10 -translate-y-10 sm:-translate-x-16 sm:-translate-y-16" />
                  <div className="absolute top-0 right-0 size-20 sm:size-32 bg-slate-900 rotate-45 translate-x-10 -translate-y-10 sm:translate-x-16 sm:-translate-y-16" />

                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <Image src="/favicon.jpg" alt="Logo" width={40} height={40} className="relative z-10 w-8 sm:w-12" />
                    <h2 className="text-[10px] sm:text-lg font-black uppercase tracking-[0.2em] text-slate-400">
                      Certificate of Excellence
                    </h2>
                    <div className="text-[7px] sm:text-[10px] font-mono text-slate-300 font-bold tracking-widest -mt-1 sm:-mt-2">ID: {cert.code}</div>
                    <div className="h-0.5 w-12 bg-slate-900 mx-auto" />
                  </div>

                  <div className="space-y-1 sm:space-y-4">
                    <p className="text-[10px] sm:text-base italic font-serif text-slate-500">This is to certify that</p>
                    <h3 className="text-xl sm:text-4xl font-black tracking-tight text-slate-900">{certUser.name}</h3>
                    <p className="text-[10px] sm:text-base italic font-serif text-slate-500">has successfully completed the course</p>
                    <h4 className="text-xs sm:text-2xl font-black text-slate-700 uppercase">{tDb(course.title, locale)}</h4>
                  </div>

                  <div className="w-full flex justify-around items-center border-t pt-2 sm:pt-6 border-slate-200 px-8 sm:px-24">
                    <div className="flex flex-col items-center text-center space-y-0.5 relative pt-4 sm:pt-6">
                      <div className="text-[6px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-1 sm:pb-2">{issuedDate}</div>
                      <Image src="/TTD.png" alt="TTD" width={100} height={50} className="w-16 sm:w-24 pointer-events-none" />
                      <div className="font-bold text-slate-900 text-[8px] sm:text-base pt-1 sm:pt-2">{process.env.NEXT_PUBLIC_SIGNER_NAME || "Lead Instructor"}</div>
                      <div className="text-[5px] sm:text-[8px] uppercase text-slate-400 font-bold">{process.env.NEXT_PUBLIC_SIGNER_TITLE || "CEO & Founder"}</div>
                      <div className="text-[5px] sm:text-[8px] text-slate-300 font-bold">{appUrl.replace(/^https?:\/\//, "")}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                       <div className="size-8 sm:size-16 border-2 border-slate-900 flex items-center justify-center p-0.5 bg-white mb-1">
                          <Image src={qrCodeUrl} alt="QR" width={64} height={64} className="size-full" unoptimized />
                       </div>
                       <div className="text-center w-full">
                          <div className="font-black text-[5px] sm:text-[10px] text-slate-900 leading-none">{process.env.NEXT_PUBLIC_BRAND_NAME || "AJAR"} Training Partner</div>
                       </div>
                       <div className="pt-1 text-[5px] sm:text-[8px] uppercase text-slate-400 font-bold">{t("validUntil", { date: formattedExpiry.toUpperCase() })}</div>
                    </div>
                  </div>
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <BookOpen className="size-5 text-blue-600" />
                        {t("curriculumTitle")}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                        <Clock className="size-3" /> {formatMinutes(totalDuration)}
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {course.modules.map((module: any, idx: number) => {
                        const moduleM = module as { lessons: Array<{ duration: number | null }> };
                        const moduleDuration = moduleM.lessons.reduce((acc: number, l: any) => acc + (l.duration || 0), 0);
                        return (
                            <div key={module.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-slate-900">{idx + 1}. {tDb(module.title, locale)}</h4>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{formatMinutes(moduleDuration)}</span>
                                </div>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                                    {module.lessons.map((lesson: any) => (
                                        <li key={lesson.id} className="text-sm text-slate-500 flex items-center gap-2">
                                            <div className="size-1 bg-slate-300 rounded-full" />
                                            {tDb(lesson.title, locale)}
                                            <span className="text-[9px] text-slate-300 ml-auto">({lesson.duration}m)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden relative">
                        {certUser.image ? (
                            <Image src={certUser.image} alt={certUser.name || "User"} fill unoptimized className="object-cover" />
                        ) : (
                            <User className="size-6" />
                        )}
                    </div>
                    <div>
                        <div className="font-black text-slate-900">{certUser.name}</div>
                        <div className="text-xs text-slate-500">{t("verifiedLearner")}</div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("status")}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle className="size-3" /> {t("active")}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("issuedOn")}</span>
                        <span className="text-sm font-bold text-slate-900">{issuedDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("validUntil", { date: "" }).replace(":", "")}</span>
                        <span className="text-sm font-bold text-slate-900">{formattedExpiry}</span>
                    </div>
                </div>

                {session?.user?.id === cert.userId && (
                    <Link 
                        href={`/${locale}/dashboard`} 
                        className="flex w-full items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-bold text-slate-900 transition-colors"
                    >
                        {t("viewDashboard")}
                    </Link>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
