import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { Plus, Users, BookOpen, DollarSign, LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function InstructorCoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const locale = await getLocale();

  const instructorCourses = await db.query.courses.findMany({
    where: (c: any, { eq }: any) => eq(c.authorId, session?.user.id),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
    orderBy: (c: any, { desc }: any) => [desc(c.createdAt)],
  });

  // Calculate stats
  const totalCourses = instructorCourses.length;
  const publishedCourses = instructorCourses.filter(c => c.status === "published").length;
  
  // Fetch enrollment counts for these courses
  const enrollments = await db.query.enrollments.findMany({
    where: (e: any, { inArray }: any) => 
      instructorCourses.length > 0 
        ? inArray(e.courseId, instructorCourses.map(c => c.id))
        : undefined,
  });

  const totalStudents = new Set(enrollments.map(e => e.userId)).size;
  const totalRevenue = enrollments.length * 0; // Simplified for now, in real app fetch from payments

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Instructor Studio
          </h1>
          <p className="text-muted-foreground">Kelola kurikulum dan pantau perkembangan student Anda.</p>
        </div>
        <Link 
          href={`/${locale}/studio/courses/new`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-100 px-6 py-4 text-sm font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95 shadow-xl shadow-primary/10"
        >
          <Plus className="size-5" />
          Tambah Kursus
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
               <BookOpen className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Kursus</p>
               <p className="text-2xl font-black">{totalCourses}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
               <Users className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Student</p>
               <p className="text-2xl font-black">{totalStudents}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">
               <LayoutGrid className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Published</p>
               <p className="text-2xl font-black">{publishedCourses}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-500">
               <DollarSign className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Estimasi Revenue</p>
               <p className="text-2xl font-black">Rp {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </article>
      </div>

      {/* Course List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-black uppercase tracking-tight">Daftar Kursus</h2>
          <div className="flex items-center gap-2">
             <button className="rounded-lg p-2 text-primary bg-primary/10"><LayoutGrid className="size-4" /></button>
             <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><List className="size-4" /></button>
          </div>
        </div>

        {instructorCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructorCourses.map((course) => {
              const studentCount = enrollments.filter(e => e.courseId === course.id).length;
              return (
                <div key={course.id} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-2xl hover:shadow-primary/5">
                  <div className="relative aspect-video w-full overflow-hidden">
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt={course.titleId} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <BookOpen className="size-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        course.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="line-clamp-2 text-lg font-black leading-tight mb-4 min-h-[3.5rem]">
                      {locale === 'id' ? course.titleId : course.titleEn}
                    </h3>
                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <Users className="size-4" />
                            {studentCount}
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <BookOpen className="size-4" />
                            {course.modules.flatMap(m => m.lessons).length} Lesson
                         </div>
                      </div>
                      <Link 
                        href={`/${locale}/studio/courses/${course.id}/edit`}
                        className="rounded-xl border bg-muted/50 p-2 text-xs font-bold hover:bg-muted transition-all"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-muted p-20 text-center space-y-6">
             <div className="rounded-full bg-muted p-10">
                <Plus className="size-20 text-muted-foreground/20" />
             </div>
             <div className="space-y-2">
                <p className="text-2xl font-black">Belum ada kursus yang dibuat</p>
                <p className="text-muted-foreground max-w-sm">Mulai bagikan ilmu Anda hari ini. Buat kurikulum pertama Anda sekarang!</p>
             </div>
             <Link 
               href={`/${locale}/studio/courses/new`}
               className="rounded-2xl bg-primary px-8 py-4 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90"
             >
               Buat Kursus Pertama
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
