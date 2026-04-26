import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/course/ProgressBar";
import { PlayCircle, CheckCircle2, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export default async function MyCoursesPage() {
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
    };
  });

  return (
    <section className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight uppercase">Kursus Saya</h1>
        <p className="text-muted-foreground">Lanjutkan perjalanan belajarmu di sini.</p>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      Belajar <PlayCircle className="size-4" />
                   </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 font-black text-sm text-slate-900 dark:text-slate-100 mb-4 h-10">
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
                    href={course.progressPercent === 100 ? `/${locale}/courses/${course.slug}` : `/${locale}/learn/${course.slug}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-[10px] font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95"
                  >
                    {course.progressPercent === 100 ? "Review" : "Lanjutkan"}
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
              <p className="text-sm text-muted-foreground">Kamu belum terdaftar di kursus apapun.</p>
           </div>
           <Link 
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition-all hover:opacity-90"
           >
              Jelajahi Kursus
           </Link>
        </div>
      )}
    </section>
  );
}
