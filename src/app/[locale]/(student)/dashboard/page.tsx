import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/course/ProgressBar";
import { BookOpen, Trophy, PlayCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { VerificationResendButton } from "@/components/auth/VerificationResendButton";

export default async function StudentDashboardPage() {
  const t = await getTranslations("student");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const locale = await getLocale();

  const userWithProgress = await db.query.users.findFirst({
    where: (u: any, { eq }: any) => eq(u.id, session.user.id),
    with: {
      enrollments: {
        with: {
          course: {
            with: {
              modules: {
                with: {
                  lessons: true,
                },
              },
            },
          },
        },
      },
      lessonProgress: true,
    },
  });

  if (!userWithProgress) return null;

  const totalLessonsDone = userWithProgress.lessonProgress.length;
  const enrolledCourses = userWithProgress.enrollments.map((enrollment) => {
    const course = enrollment.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;
    const completedInThisCourse = allLessons.filter((lesson) =>
      userWithProgress.lessonProgress.some((lp) => lp.lessonId === lesson.id)
    ).length;

    const progressPercent = totalLessons > 0 
      ? Math.round((completedInThisCourse / totalLessons) * 100) 
      : 0;

    return {
      id: course.id,
      slug: course.slug,
      title: locale === "id" ? course.titleId : course.titleEn,
      thumbnail: course.thumbnail,
      progressPercent,
      totalLessons,
      completedLessons: completedInThisCourse,
      firstLessonId: allLessons[0]?.id,
    };
  });

  const totalPossibleLessons = enrolledCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const globalLessonProgress = totalPossibleLessons > 0 ? Math.round((totalLessonsDone / totalPossibleLessons) * 100) : 0;
  const coursesDone = enrolledCourses.filter(c => c.progressPercent === 100).length;
  const activeCoursesCount = enrolledCourses.length - coursesDone;
  const courseCompletionRate = enrolledCourses.length > 0 ? Math.round((coursesDone / enrolledCourses.length) * 100) : 0;

  return (
    <section className="space-y-8 pb-12">
      {!session.user.emailVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Email belum diverifikasi</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Silakan verifikasi email Anda untuk mendapatkan akses penuh ke fitur sertifikat dan lainnya.</p>
              </div>
            </div>
            <VerificationResendButton email={session.user.email} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-muted-foreground">Selamat datang kembali, {session.user.name}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <article className="group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-2xl hover:shadow-primary/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Kursus Aktif</p>
              <p className="text-4xl font-black">{activeCoursesCount}</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
               <BookOpen className="size-6" />
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={courseCompletionRate} showLabel={false} />
            <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
               {coursesDone} dari {enrolledCourses.length} kursus selesai
            </p>
          </div>
        </article>

        <article className="group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-2xl hover:shadow-primary/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Lesson Selesai</p>
              <p className="text-4xl font-black">{totalLessonsDone}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
               <CheckCircle2 className="size-6" />
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={globalLessonProgress} showLabel={false} />
            <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
               {globalLessonProgress}% kurikulum selesai
            </p>
          </div>
        </article>

        <article className="group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-2xl hover:shadow-primary/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Total XP</p>
              <p className="text-4xl font-black">{userWithProgress.xp}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
               <Trophy className="size-6" />
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={Math.min(100, (userWithProgress.xp / 1000) * 100)} showLabel={false} />
            <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
               Level {(Math.floor(userWithProgress.xp / 500)) + 1} • {userWithProgress.xp} XP
            </p>
          </div>
        </article>
      </div>

      {/* Courses in Progress */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight uppercase">Kursus Saya</h2>
            <Link href={`/${locale}/my-courses`} className="text-xs font-bold text-primary hover:underline">Lihat Semua</Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <div 
                key={course.id} 
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  {course.thumbnail ? (
                    <Image 
                      src={course.thumbnail} 
                      alt={course.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <PlayCircle className="size-12 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
                     <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        Lanjutkan Belajar <PlayCircle className="size-4" />
                     </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-black text-slate-900 dark:text-slate-100 mb-4 h-12">
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto space-y-3">
                    <ProgressBar value={course.progressPercent} />
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                       <span>{course.completedLessons} / {course.totalLessons} Lesson</span>
                       {course.progressPercent === 100 && (
                          <span className="text-emerald-500 flex items-center gap-1">
                             <CheckCircle2 className="size-3" /> Selesai
                          </span>
                       )}
                    </div>
                    <Link 
                      href={(course.progressPercent === 100 ? `/${locale}/courses/${course.slug}` : `/${locale}/learn/${course.slug}/${course.firstLessonId}`) as any}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-3 text-xs font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95"
                    >
                      {course.progressPercent === 100 ? "Review Kursus" : "Lanjutkan Belajar"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center space-y-4">
             <div className="rounded-full bg-muted p-6">
                <BookOpen className="size-12 text-muted-foreground/30" />
             </div>
             <div className="space-y-1">
                <p className="font-black">Belum ada kursus</p>
                <p className="text-sm text-muted-foreground">Mulai petualangan belajarmu hari ini!</p>
             </div>
             <Link 
                href={`/${locale}/courses`}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition-all hover:opacity-90"
             >
                Cari Kursus
             </Link>
          </div>
        )}
      </div>
    </section>
  );
}
