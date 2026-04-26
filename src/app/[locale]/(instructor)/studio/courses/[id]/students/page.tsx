import { getCourseStudents } from "@/actions/instructor-analytics";
import { getCourseBySlug } from "@/actions/course"; // Wait, I need it by ID or slug? The param is [id].
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Users, Search, Mail, Calendar, GraduationCap, ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import Image from "next/image";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const students = await getCourseStudents(id);
  
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });

  if (!course) return <div>Course not found</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b pb-8">
        <div className="space-y-2">
          <Link 
            href={`/${locale}/studio/courses`}
            className="group flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
            Kembali ke Studio
          </Link>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Manajemen Siswa: <span className="text-primary">{locale === 'id' ? course.titleId : course.titleEn}</span>
          </h1>
          <p className="text-muted-foreground font-medium">Pantau progres dan interaksi siswa di kursus Anda.</p>
        </div>
      </header>

      {/* Student List Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
         <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Siswa</p>
            <p className="mt-1 text-3xl font-black">{students.length}</p>
         </div>
         <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selesai Belajar</p>
            <p className="mt-1 text-3xl font-black">{students.filter(s => s.completedAt).length}</p>
         </div>
         <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progres Rata-rata</p>
            <p className="mt-1 text-3xl font-black">
               {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0}%
            </p>
         </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-[2.5rem] border bg-card shadow-xl shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Siswa</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Terdaftar Pada</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progres</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.id} className="group transition-colors hover:bg-muted/30">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative size-12 overflow-hidden rounded-2xl bg-muted border-2 border-background shadow-sm">
                        {student.image ? (
                          <Image src={student.image} alt={student.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                            <span className="font-black">{student.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black leading-tight">{student.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        {new Date(student.enrolledAt).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="w-48 space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span>{student.progress}% Selesai</span>
                          {student.completedAt && (
                             <span className="text-emerald-500 flex items-center gap-1">
                                <GraduationCap className="size-3" />
                                LULUS
                             </span>
                          )}
                       </div>
                       <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div 
                             className={`h-full transition-all duration-500 ${student.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                             style={{ width: `${student.progress}%` }} 
                          />
                       </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted transition-all">
                      <MoreHorizontal className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Users className="size-8 text-muted-foreground/30" />
                    </div>
                    <p className="font-black text-xl">Belum ada siswa terdaftar</p>
                    <p className="text-muted-foreground font-medium">Promosikan kursus Anda untuk mendapatkan siswa pertama!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
