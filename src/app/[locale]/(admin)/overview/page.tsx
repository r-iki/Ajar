import { db } from "@/lib/db";
import { Users, BookOpen, DollarSign, TrendingUp, ShieldCheck } from "lucide-react";
import { count } from "drizzle-orm";
import { users as usersTable, courses as coursesTable, enrollments } from "@/lib/db/schema";
import { getLocale, getTranslations } from "next-intl/server";
import { tDb } from "@/lib/i18n/db-helper";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const t = await getTranslations("admin");
  const [totalUsers] = await db.select({ value: count() }).from(usersTable);
  const [totalCourses] = await db.select({ value: count() }).from(coursesTable);
  const [totalEnrollments] = await db.select({ value: count() }).from(enrollments);
  
  const recentUsers = await db.query.users.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    limit: 5,
  });

  const recentCourses = await db.query.courses.findMany({
    orderBy: (c, { desc }) => [desc(c.createdAt)],
    limit: 5,
    with: {
        author: true
    }
  });

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-1">
        <div className="flex items-center gap-3 text-rose-500">
           <ShieldCheck className="size-6" />
           <span className="text-xs font-black uppercase tracking-widest">{t("controlPanel")}</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("overviewTitle")}
        </h1>
        <p className="text-muted-foreground">{t("overviewSubtitle")}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
               <Users className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("totalUsers")}</p>
               <p className="text-2xl font-black">{totalUsers.value}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
               <BookOpen className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("totalCourses")}</p>
               <p className="text-2xl font-black">{totalCourses.value}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">
               <TrendingUp className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("enrollments")}</p>
               <p className="text-2xl font-black">{totalEnrollments.value}</p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500">
               <DollarSign className="size-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("revenue")}</p>
               <p className="text-2xl font-black">Rp 0</p>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
         <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight flex items-center gap-3">
               <Users className="size-5 text-blue-500" /> {t("recentUsers")}
            </h2>
            <div className="space-y-4">
               {recentUsers.map((user) => (
                 <div key={user.id} className="flex items-center justify-between rounded-2xl bg-background/50 p-4">
                    <div className="flex items-center gap-3">
                       <div className="size-10 overflow-hidden rounded-xl bg-muted">
                          {user.image && <img src={user.image} alt={user.name} className="h-full w-full object-cover" />}
                       </div>
                       <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                       </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-rose-500 text-white' : 
                      user.role === 'instructor' ? 'bg-blue-500 text-white' : 
                      'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                 </div>
               ))}
            </div>
         </section>

         <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight flex items-center gap-3">
               <BookOpen className="size-5 text-emerald-500" /> {t("recentCourses")}
            </h2>
            <div className="space-y-4">
               {recentCourses.map((course) => (
                 <div key={course.id} className="flex items-center justify-between rounded-2xl bg-background/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 overflow-hidden rounded-xl bg-muted">
                           {course.thumbnail && <img src={course.thumbnail} alt={tDb(course.title, locale)} className="h-full w-full object-cover" />}
                        </div>
                        <div className="max-w-[150px] sm:max-w-[200px]">
                           <p className="truncate text-sm font-bold">{tDb(course.title, locale)}</p>
                           <p className="text-[10px] text-muted-foreground font-medium">{course.author?.name}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      course.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {course.status}
                    </span>
                 </div>
               ))}
            </div>
         </section>
      </div>
    </div>
  );
}
