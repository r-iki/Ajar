import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SectionTabBar from "@/components/layout/SectionTabBar";
import {
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Flame,
  Activity,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ResumePaymentButton } from "@/components/payment/ResumePaymentButton";
import { tDb } from "@/lib/i18n/db-helper";

const ABSTRACT_PLACEHOLDER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";

type MyCoursesPageProps = {
  searchParams: Promise<{ status?: string }>;
};

// --- Helpers ---

function calcStreak(lessonProgress: { completedAt: Date }[]): number {
  if (!lessonProgress.length) return 0;
  const activeDays = new Set(lessonProgress.map(lp => new Date(lp.completedAt).toDateString()));
  let streak = 0;
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  while (activeDays.has(day.toDateString())) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

function calcLast7Days(lessonProgress: { completedAt: Date }[]): { label: string; count: number }[] {
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    const count = lessonProgress.filter(lp => new Date(lp.completedAt).toDateString() === key).length;
    days.push({ label: d.toLocaleDateString("default", { weekday: "short" }), count });
  }
  return days;
}

function calcBestDay(lessonProgress: { completedAt: Date }[]): number {
  const map = new Map<string, number>();
  for (const lp of lessonProgress) {
    const k = new Date(lp.completedAt).toDateString();
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map.size > 0 ? Math.max(...map.values()) : 0;
}

// ponytail: badge logic computed from existing data — no extra DB query
type BadgeKey = "firstStep" | "onFire" | "scholar" | "courseMaster" | "xpHunter" | "diamond";
function calcBadges(totalLessons: number, streak: number, completedCourses: number, totalXp: number): Record<BadgeKey, boolean> {
  return {
    firstStep: totalLessons >= 1,
    onFire: streak >= 3,
    scholar: totalLessons >= 10,
    courseMaster: completedCourses >= 1,
    xpHunter: totalXp >= 100,
    diamond: totalXp >= 500,
  };
}

export default async function MyCoursesPage({ searchParams }: MyCoursesPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");

  const session = await getSession();
  if (!session) redirect(`/${locale}/sign-in`);

  const userWithProgress = await db.query.users.findFirst({
    where: (u: any, { eq }: any) => eq(u.id, session.user.id),
    with: {
      enrollments: {
        with: {
          course: {
            with: {
              modules: {
                with: { lessons: true },
              },
            },
          },
        },
      },
      payments: {
        where: (p, { eq }) => eq(p.status, "pending"),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
      },
      lessonProgress: {
        orderBy: (lp: any, { desc }: any) => [desc(lp.completedAt)],
      },
      xpTransactions: {
        orderBy: (x: any, { desc }: any) => [desc(x.createdAt)],
      },
    },
  });

  if (!userWithProgress) return null;

  // --- Computed stats ---
  const totalLessonsDone = userWithProgress.lessonProgress.length;
  const activeDaysSet = new Set(userWithProgress.lessonProgress.map(lp => new Date(lp.completedAt).toDateString()));
  const activeDaysCount = activeDaysSet.size;
  const avgPerDay = activeDaysCount > 0 ? (totalLessonsDone / activeDaysCount).toFixed(1) : "0";
  const streak = calcStreak(userWithProgress.lessonProgress);
  const last7Days = calcLast7Days(userWithProgress.lessonProgress);
  const maxCount = Math.max(...last7Days.map(d => d.count), 1);
  const bestDayCount = calcBestDay(userWithProgress.lessonProgress);
  const consistency = activeDaysCount > 0 ? Math.min(Math.round((activeDaysCount / 30) * 100), 100) : 0;
  const totalXp = userWithProgress.xpTransactions?.reduce((sum: number, x: any) => sum + x.amount, 0) ?? 0;
  const completedCourses = userWithProgress.enrollments.filter(e => e.completedAt).length;
  const hasActivity = last7Days.some(d => d.count > 0);

  const badges = calcBadges(totalLessonsDone, streak, completedCourses, totalXp);

  // --- Courses ---
  const enrolledCourses = userWithProgress.enrollments.map((enrollment) => {
    const course = enrollment.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;
    const completedInThisCourse = allLessons.filter((lesson) =>
      userWithProgress.lessonProgress.some((lp) => lp.lessonId === lesson.id)
    ).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedInThisCourse / totalLessons) * 100) : 0;
    const pendingPayment = userWithProgress.payments.find(p => p.courseId === course.id);

    return {
      id: course.id,
      slug: course.slug,
      title: tDb(course.title, locale),
      thumbnail: typeof course.thumbnail === "string" && course.thumbnail.trim() !== "" && course.thumbnail !== "{}" ? course.thumbnail : ABSTRACT_PLACEHOLDER,
      progressPercent,
      totalLessons,
      completedLessons: completedInThisCourse,
      firstLessonId: allLessons[0]?.id,
      paymentStatus: enrollment.paymentStatus,
    };
  });

  const BADGE_CONFIG: { key: BadgeKey; icon: string; nameKey: string; descKey: string; color: string }[] = [
    { key: "firstStep", icon: "🎯", nameKey: "badgeFirstStep", descKey: "badgeFirstStepDesc", color: "blue" },
    { key: "onFire", icon: "🔥", nameKey: "badgeOnFire", descKey: "badgeOnFireDesc", color: "orange" },
    { key: "scholar", icon: "📚", nameKey: "badgeScholar", descKey: "badgeScholarDesc", color: "violet" },
    { key: "courseMaster", icon: "🏆", nameKey: "badgeCourseMaster", descKey: "badgeCourseMasterDesc", color: "amber" },
    { key: "xpHunter", icon: "⚡", nameKey: "badgeXpHunter", descKey: "badgeXpHunterDesc", color: "yellow" },
    { key: "diamond", icon: "💎", nameKey: "badgeDiamond", descKey: "badgeDiamondDesc", color: "cyan" },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Activity size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">{t("learningProgress")}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight uppercase">{t("myCourses")}</h1>
        <p className="text-muted-foreground font-medium">{t("recentActivity")}</p>
      </header>

      {/* Section Tab Bar */}
      <SectionTabBar
        tabs={[
          { label: tNav("myCourses"), href: "/my-courses" },
          { label: t("xpHistory"), href: "/xp" },
          { label: tNav("certificates"), href: "/certificates" },
          { label: tNav("leaderboard"), href: "/leaderboard" },
        ]}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-foreground">{totalLessonsDone}</span>
            <span className="text-sm font-bold text-muted-foreground">{t("lessonsCompleted")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t("last30Days")}</span>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-foreground">{activeDaysCount}</span>
            <span className="text-sm font-bold text-muted-foreground">{t("activeDays")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t("daysWithActivity")}</span>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-extrabold text-foreground">{avgPerDay}</span>
            <span className="text-sm font-bold text-muted-foreground">{t("lessonsPerDay")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t("perActiveDay")}</span>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CSS Bar Chart — last 7 days */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("learningProgressChart")}</h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{totalXp} XP</span>
          </div>

          {hasActivity ? (
            <div className="flex items-end gap-2 h-36">
              {last7Days.map((day, i) => {
                const heightPct = Math.round((day.count / maxCount) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{day.count > 0 ? day.count : ""}</span>
                    <div className="w-full rounded-t-xl bg-muted/40 flex items-end" style={{ height: "100px" }}>
                      <div
                        className="w-full rounded-t-xl bg-primary transition-all duration-700"
                        style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{day.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-[2rem] border border-border/50 gap-4">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                <Activity size={28} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-muted-foreground">{t("noActivityYet")}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{t("noActivityHint")}</p>
              </div>
              <Link href="/courses" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                {t("startLearning")}
              </Link>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col gap-6 backdrop-blur-sm shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("performanceInsights")}</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Award size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{t("bestDay")}</span>
                  <span className="text-[10px] text-muted-foreground">{bestDayCount} {t("lessons")}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>

            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-amber-500/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <Flame size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{t("currentStreak")}</span>
                  <span className="text-[10px] text-muted-foreground">{streak} {t("days")}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>

            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 flex items-center justify-between group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <TrendingUp size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{t("consistency")}</span>
                  <span className="text-[10px] text-muted-foreground">{consistency}%</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight uppercase">{t("myCourses")}</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrolledCourses.map((course) => {
              const isPending = course.paymentStatus === "pending";
              return (
                <div key={course.id} className="group bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/40 transition-all shadow-sm">
                  <div className="relative aspect-video m-2 rounded-[2rem] overflow-hidden">
                    <Image src={course.thumbnail || ABSTRACT_PLACEHOLDER} alt={course.title} fill className="object-cover transition-transform group-hover:scale-110" />
                    {isPending && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-amber-500 px-3 py-1 rounded-full">{t("pendingPayment")}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 pt-2 space-y-6">
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 h-10">{course.title}</h3>
                    {!isPending && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          <span>{t("progress")}</span>
                          <span>{course.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${course.progressPercent}%` }} />
                        </div>
                      </div>
                    )}
                    {isPending ? (
                      <ResumePaymentButton courseSlug={course.slug} />
                    ) : (
                      <Link
                        href={course.firstLessonId ? `/learn/${course.slug}/${course.firstLessonId}` : `/courses/${course.slug}`}
                        className="flex items-center justify-center w-full py-3 bg-primary text-primary-foreground rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                      >
                        {course.progressPercent === 100 ? t("review") : t("continue")}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-[3rem] gap-6">
            <BookOpen size={48} className="text-muted-foreground/40" />
            <p className="font-bold text-foreground uppercase tracking-widest">{t("noCoursesFound")}</p>
            <Link href="/courses" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20">{t("browseCourses")}</Link>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight uppercase">{t("badgesTitle")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BADGE_CONFIG.map(({ key, icon, nameKey, descKey }) => {
            const earned = badges[key];
            return (
              <div
                key={key}
                className={`flex flex-col items-center gap-3 p-5 rounded-3xl border text-center transition-all ${
                  earned
                    ? "bg-card border-primary/30 shadow-sm shadow-primary/10"
                    : "bg-muted/20 border-border/30 opacity-50 grayscale"
                }`}
              >
                <span className="text-3xl">{icon}</span>
                <div className="space-y-1">
                  <p className="text-xs font-black text-foreground">{t(nameKey as any)}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t(descKey as any)}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {earned ? t("unlocked") : t("locked")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
