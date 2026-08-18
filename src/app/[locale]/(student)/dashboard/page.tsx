import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  BookOpen, 
  Trophy, 
  PlayCircle, 
  CheckCircle2, 
  LayoutDashboard, 
  Clock, 
  Award, 
  Flame,
  Activity,
  History,
  GraduationCap
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SectionTabBar from "@/components/layout/SectionTabBar";
import { VerificationResendButton } from "@/components/auth/VerificationResendButton";
import { tDb } from "@/lib/i18n/db-helper";

export default async function StudentDashboardPage() {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

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
      lessonProgress: {
        orderBy: (lp, { desc }) => [desc(lp.completedAt)],
        limit: 5,
        with: {
          lesson: {
            with: {
              module: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      certificates: true,
    },
  });

  if (!userWithProgress) return null;

  const totalCourses = userWithProgress.enrollments.length;
  const completedCourses = userWithProgress.enrollments.filter(e => e.completedAt).length;
  const inProgressCourses = totalCourses - completedCourses;
  const totalCertificates = userWithProgress.certificates.length;

  const allLessons = userWithProgress.enrollments.flatMap(e => e.course.modules.flatMap(m => m.lessons));
  const totalLessons = allLessons.length;
  
  const completedLessonsCount = await db.query.lessonProgress.findMany({
    where: (lp, { eq }) => eq(lp.userId, session.user.id),
  }).then(res => res.length);

  const overallProgress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <LayoutDashboard size={16} />
           <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("dashboard")}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight uppercase flex items-center gap-4">
           {t("dashboard")}
        </h1>
        <p className="text-muted-foreground font-medium">{t("welcome")}, <span className="text-foreground font-extrabold">{session.user.name}</span>!</p>
      </header>

      {/* Quick Nav */}
      <SectionTabBar
        sectionLabel={t("quickNavigate")}
        tabs={[
          { label: tNav("dashboard"), href: "/dashboard" },
          { label: tNav("myCourses"), href: "/my-courses" },
          { label: tNav("certificates"), href: "/certificates" },
          { label: tNav("leaderboard"), href: "/leaderboard" },
          { label: tNav("transactions"), href: "/transactions" },
          { label: tNav("settings"), href: "/settings" },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{t("learningProgress")}</span>
                 <span className="text-5xl font-extrabold text-foreground">{totalCourses}</span>
              </div>
              <div className="p-5 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                 <GraduationCap size={32} />
              </div>
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{t("enrolledCourses")}</span>
           </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{t("achievements")}</span>
                 <span className="text-5xl font-extrabold text-emerald-500">{completedCourses}</span>
              </div>
              <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
                 <CheckCircle2 size={32} />
              </div>
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{t("completedCourses")}</span>
           </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{t("inProgressTab")}</span>
                 <span className="text-5xl font-extrabold text-amber-500">{inProgressCourses}</span>
              </div>
              <div className="p-5 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                 <Clock size={32} />
              </div>
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{t("inProgressTab")}</span>
           </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{t("certifications")}</span>
                 <span className="text-5xl font-extrabold text-primary">{totalCertificates}</span>
              </div>
              <div className="p-5 bg-primary/10 rounded-2xl text-primary border border-primary/20 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                 <Award size={32} />
              </div>
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{t("earnedCertificates")}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Learning Progress Card */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-8 backdrop-blur-sm relative overflow-hidden group shadow-sm">
             <div className="absolute top-0 right-0 p-8 text-muted/30 group-hover:text-primary/10 transition-colors">
                <Activity size={160} />
             </div>
             
             <div className="flex items-center justify-between relative z-10">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">{t("learningProgress")}</h2>
             </div>

             <div className="space-y-6 relative z-10 bg-muted/30 border border-border/50 p-8 rounded-[2rem] backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-sm font-bold text-foreground">{t("overallCompletion")}</span>
                   <span className="text-3xl font-extrabold text-primary">{overallProgress}%</span>
                </div>
                
                <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border border-border shadow-inner">
                   <div 
                      className="h-full bg-linear-to-r from-primary via-amber-500 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(217,83,44,0.4)]"
                      style={{ width: `${overallProgress}%` }}
                   />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-4">
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {t("completedCount", { count: completedLessonsCount })}
                   </span>
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {t("inProgressCount", { count: inProgressCourses })}
                   </span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-center gap-5 group/item hover:border-emerald-500/40 transition-all backdrop-blur-md">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                      <Clock size={24} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl font-extrabold text-foreground">0</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t("studyHours")}</span>
                   </div>
                </div>

                <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-center gap-5 group/item hover:border-amber-500/40 transition-all backdrop-blur-md">
                   <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 group-hover/item:scale-110 transition-transform">
                      <Flame size={24} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl font-extrabold text-foreground">0</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t("dayStreak")}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-8 backdrop-blur-sm h-full shadow-sm">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">{t("recentActivity")}</h2>
              <Link href="/my-courses" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors">{t("viewAll")}</Link>
           </div>

           <div className="flex-1 flex flex-col gap-6 overflow-hidden bg-muted/30 border border-border/50 p-8 rounded-[2rem] backdrop-blur-md">
              {userWithProgress.lessonProgress.length > 0 ? (
                <div className="space-y-8 relative">
                   <div className="absolute top-2 bottom-2 left-[19px] w-px bg-border" />
                   
                   {userWithProgress.lessonProgress.map((progress, idx) => (
                      <div key={progress.id} className="flex gap-6 relative z-10 group/act">
                         <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shadow-sm group-hover/act:border-primary/40 transition-all group-hover/act:scale-110">
                            <PlayCircle size={18} />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                               {new Date(progress.completedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                            </span>
                             <span className="text-xs font-bold text-foreground leading-relaxed line-clamp-2">
                                {t("completedLessonActivity", { title: tDb(progress.lesson.title, locale) })}
                             </span>
                         </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                   <div className="p-6 bg-muted rounded-full border border-border text-muted-foreground shadow-inner">
                      <Activity size={32} />
                   </div>
                   <div className="text-center space-y-1 px-4">
                      <p className="text-sm font-bold text-foreground">{t("noRecentActivity")}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] leading-relaxed">{t("startLearningActivityHint")}</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
