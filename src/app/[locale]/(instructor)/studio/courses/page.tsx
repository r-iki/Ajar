import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { Plus, Users, BookOpen, DollarSign, LayoutGrid, List, TrendingUp, ArrowUpRight, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getInstructorStats, getCoursePerformance } from "@/actions/instructor-analytics";

export default async function InstructorCoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null; // Or redirect
  }

  const locale = await getLocale();
  const stats = await getInstructorStats();
  const performance = await getCoursePerformance();

  const instructorCourses = await db.query.courses.findMany({
    where: (c: any, { eq }: any) => eq(c.authorId, session.user.id),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
    orderBy: (c: any, { desc }: any) => [desc(c.createdAt)],
  });

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Instructor Studio
          </h1>
          <p className="text-muted-foreground font-medium">Kelola kurikulum dan pantau performa pengajaran Anda.</p>
        </div>
        <Link 
          href={`/${locale}/studio/courses/new`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-100 px-6 py-4 text-sm font-black text-white dark:text-slate-900 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/10"
        >
          <Plus className="size-5" />
          Tambah Kursus Baru
        </Link>
      </header>

      {/* Analytics Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Kursus", value: stats.totalCourses, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Student", value: stats.totalStudents, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pendaftaran", value: stats.totalEnrollments, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Revenue", value: `Rp ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((item, i) => (
          <article key={i} className="group relative overflow-hidden rounded-3xl border bg-card p-6 transition-all hover:shadow-lg">
             <div className="flex items-center gap-4">
                <div className={`rounded-2xl ${item.bg} ${item.color} p-4 transition-transform group-hover:scale-110`}>
                   <item.icon className="size-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                   <p className="text-2xl font-black">{item.value}</p>
                </div>
             </div>
          </article>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Course Performance List */}
         <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
               <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <h2 className="text-lg font-black uppercase tracking-tight">Performa Kursus</h2>
               </div>
            </div>
            <div className="overflow-hidden rounded-[2.5rem] border bg-card/50 backdrop-blur-sm">
               <div className="divide-y">
                  {performance.slice(0, 5).map((course) => (
                     <div key={course.id} className="group flex items-center justify-between p-6 transition-colors hover:bg-muted/50">
                        <div className="space-y-1">
                           <p className="font-black group-hover:text-primary transition-colors">{course.title}</p>
                           <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              <span className="flex items-center gap-1">
                                 <Users className="size-3" />
                                 {course.enrollmentCount} Student Terdaftar
                              </span>
                           </div>
                        </div>
                        <Link 
                           href={`/${locale}/studio/courses/${course.id}/edit`}
                           className="flex size-10 items-center justify-center rounded-full bg-muted transition-all hover:bg-primary hover:text-white"
                        >
                           <ArrowUpRight className="size-4" />
                        </Link>
                     </div>
                  ))}
                  {performance.length === 0 && (
                     <div className="p-10 text-center text-muted-foreground font-medium">
                        Belum ada data pendaftaran.
                     </div>
                  )}
               </div>
            </div>
         </section>

         {/* Quick Actions / Tips */}
         <aside className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight">Informasi Instruktur</h2>
            <div className="rounded-[2.5rem] bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-500/20">
               <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
                  <TrendingUp className="size-6" />
               </div>
               <p className="text-sm font-bold opacity-80">Insight Hari Ini:</p>
               <h3 className="mt-2 text-2xl font-black leading-tight">Kursus dengan ulasan bintang 5 mendapat pendaftaran 3x lebih cepat!</h3>
               <p className="mt-4 text-xs opacity-60 leading-relaxed">
                  Pastikan Anda membalas setiap pertanyaan di kolom diskusi untuk meningkatkan rating kursus Anda.
               </p>
               <button className="mt-8 w-full rounded-2xl bg-white text-indigo-600 py-4 text-sm font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
                  Lihat Tips Mengajar
               </button>
            </div>
         </aside>
      </div>

      {/* Full Course Grid */}
      <section className="space-y-8 pt-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-black uppercase tracking-tight">Koleksi Kursus Anda</h2>
          <div className="flex items-center gap-2">
             <button className="rounded-xl p-2.5 text-primary bg-primary/10 shadow-sm"><LayoutGrid className="size-5" /></button>
             <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted transition-all"><List className="size-5" /></button>
          </div>
        </div>

        {instructorCourses.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {instructorCourses.map((course) => {
              const studentCount = performance.find(p => p.id === course.id)?.enrollmentCount || 0;
              return (
                <div key={course.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border bg-card transition-all hover:shadow-2xl hover:shadow-primary/5">
                  <div className="relative aspect-video w-full overflow-hidden">
                    {course.thumbnail ? (
                      <Image src={course.thumbnail} alt={course.titleId} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <BookOpen className="size-12 text-muted-foreground/10" />
                      </div>
                    )}
                    <div className="absolute top-5 right-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        course.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="line-clamp-2 text-xl font-black leading-tight mb-6 min-h-[3.5rem] group-hover:text-primary transition-colors">
                      {locale === 'id' ? course.titleId : course.titleEn}
                    </h3>
                    <div className="mt-auto flex items-center justify-between border-t border-dashed pt-6">
                      <div className="flex items-center gap-5">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student</span>
                            <span className="text-sm font-black">{studentCount}</span>
                         </div>
                         <div className="h-8 w-px bg-border" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lessons</span>
                            <span className="text-sm font-black">{course.modules.flatMap(m => m.lessons).length}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/${locale}/studio/courses/${course.id}/students`}
                          className="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Users className="size-3.5" />
                          Siswa
                        </Link>
                        <Link 
                          href={`/${locale}/studio/courses/${course.id}/edit`}
                          className="rounded-2xl bg-muted px-5 py-2.5 text-xs font-black hover:bg-muted/80 transition-all shadow-sm border"
                        >
                          Kelola
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[4rem] border-4 border-dashed border-muted p-20 text-center space-y-8 bg-muted/5">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative rounded-full bg-card border-8 border-muted p-12 shadow-inner">
                   <Plus className="size-24 text-primary" />
                </div>
             </div>
             <div className="space-y-3">
                <p className="text-3xl font-black tracking-tight">Mulai Perjalanan Anda</p>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
                   Bagikan pengetahuan Anda kepada dunia. Buat kurikulum pertama Anda hari ini!
                </p>
             </div>
             <Link 
               href={`/${locale}/studio/courses/new`}
               className="rounded-2xl bg-primary px-10 py-5 text-sm font-black text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all"
             >
               Buat Kursus Pertama
             </Link>
          </div>
        )}
      </section>
    </div>
  );
}
