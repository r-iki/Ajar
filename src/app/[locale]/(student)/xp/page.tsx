import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Zap, Trophy, Star, TrendingUp } from "lucide-react";
import SectionTabBar from "@/components/layout/SectionTabBar";
import { tDb } from "@/lib/i18n/db-helper";

type BadgeKey = "firstStep" | "onFire" | "scholar" | "courseMaster" | "xpHunter" | "diamond";

const BADGE_CONFIG: { key: BadgeKey; icon: string; nameKey: string; descKey: string }[] = [
  { key: "firstStep", icon: "🎯", nameKey: "badgeFirstStep", descKey: "badgeFirstStepDesc" },
  { key: "onFire", icon: "🔥", nameKey: "badgeOnFire", descKey: "badgeOnFireDesc" },
  { key: "scholar", icon: "📚", nameKey: "badgeScholar", descKey: "badgeScholarDesc" },
  { key: "courseMaster", icon: "🏆", nameKey: "badgeCourseMaster", descKey: "badgeCourseMasterDesc" },
  { key: "xpHunter", icon: "⚡", nameKey: "badgeXpHunter", descKey: "badgeXpHunterDesc" },
  { key: "diamond", icon: "💎", nameKey: "badgeDiamond", descKey: "badgeDiamondDesc" },
];

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

export default async function XpPage() {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");

  const session = await getSession();
  if (!session) redirect(`/${locale}/sign-in`);

  const user = await db.query.users.findFirst({
    where: (u: any, { eq }: any) => eq(u.id, session.user.id),
    with: {
      xpTransactions: {
        orderBy: (x: any, { desc }: any) => [desc(x.createdAt)],
      },
      lessonProgress: true,
      enrollments: {
        where: (e, { isNotNull }) => isNotNull(e.completedAt),
      },
    },
  });

  if (!user) return null;

  // Resolve UUIDs from XP reason strings to real titles
  const lessonIds: string[] = [];
  const courseIds: string[] = [];
  const quizIds: string[] = [];

  for (const tx of user.xpTransactions ?? []) {
    const lMatch = tx.reason?.match(/Completed lesson:\s*([^\s]+)/i);
    if (lMatch) lessonIds.push(lMatch[1]);

    const cMatch = tx.reason?.match(/Completed course:\s*([^\s]+)/i);
    if (cMatch) courseIds.push(cMatch[1]);

    const qMatch = tx.reason?.match(/Passed quiz:\s*([^\s]+)/i);
    if (qMatch) quizIds.push(qMatch[1]);
  }

  const [fetchedLessons, fetchedCourses, fetchedQuizzes] = await Promise.all([
    lessonIds.length > 0
      ? db.query.lessons.findMany({
          where: (l, { inArray }) => inArray(l.id, lessonIds),
        })
      : [],
    courseIds.length > 0
      ? db.query.courses.findMany({
          where: (c, { inArray }) => inArray(c.id, courseIds),
        })
      : [],
    quizIds.length > 0
      ? db.query.quizzes.findMany({
          where: (q, { inArray }) => inArray(q.id, quizIds),
          with: { lesson: true },
        })
      : [],
  ]);

  const lessonMap = new Map(fetchedLessons.map((l) => [l.id, l]));
  const courseMap = new Map(fetchedCourses.map((c) => [c.id, c]));
  const quizMap = new Map(fetchedQuizzes.map((q) => [q.id, q]));

  function formatXpReason(reason: string) {
    if (!reason) return "";

    const lMatch = reason.match(/Completed lesson:\s*([^\s]+)/i);
    if (lMatch) {
      const lesson = lessonMap.get(lMatch[1]);
      if (lesson) {
        return locale === "id"
          ? `Selesai materi: ${tDb(lesson.title, locale)}`
          : `Completed lesson: ${tDb(lesson.title, locale)}`;
      }
    }

    const cMatch = reason.match(/Completed course:\s*([^\s]+)/i);
    if (cMatch) {
      const course = courseMap.get(cMatch[1]);
      if (course) {
        return locale === "id"
          ? `Selesai kursus: ${tDb(course.title, locale)}`
          : `Completed course: ${tDb(course.title, locale)}`;
      }
    }

    const qMatch = reason.match(/Passed quiz:\s*([^\s]+)/i);
    if (qMatch) {
      const quiz = quizMap.get(qMatch[1]);
      if (quiz?.lesson) {
        return locale === "id"
          ? `Lulus kuis: ${tDb(quiz.lesson.title, locale)}`
          : `Passed quiz: ${tDb(quiz.lesson.title, locale)}`;
      }
    }

    return reason;
  }

  const totalXp = user.xpTransactions?.reduce((sum: number, x: any) => sum + x.amount, 0) ?? 0;
  const totalLessons = user.lessonProgress?.length ?? 0;
  const streak = calcStreak(user.lessonProgress ?? []);
  const completedCourses = user.enrollments?.length ?? 0;

  const badges: Record<BadgeKey, boolean> = {
    firstStep: totalLessons >= 1,
    onFire: streak >= 3,
    scholar: totalLessons >= 10,
    courseMaster: completedCourses >= 1,
    xpHunter: totalXp >= 100,
    diamond: totalXp >= 500,
  };

  const unlockedCount = Object.values(badges).filter(Boolean).length;

  // XP milestones for progress display
  const milestones = [
    { threshold: 100, label: "XP Hunter" },
    { threshold: 250, label: "Rising Star" },
    { threshold: 500, label: "Diamond" },
    { threshold: 1000, label: "Legend" },
  ];
  const nextMilestone = milestones.find(m => m.threshold > totalXp);
  const prevMilestone = milestones.filter(m => m.threshold <= totalXp).pop();
  const mileProgress = nextMilestone
    ? Math.round(((totalXp - (prevMilestone?.threshold ?? 0)) / (nextMilestone.threshold - (prevMilestone?.threshold ?? 0))) * 100)
    : 100;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Zap size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">{t("xpHistory")}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight uppercase">{t("xpHistoryTitle")}</h1>
        <p className="text-muted-foreground font-medium">{t("xpHistorySubtitle")}</p>
      </header>

      <SectionTabBar
        tabs={[
          { label: tNav("myCourses"), href: "/my-courses" },
          { label: t("xpHistory"), href: "/xp" },
          { label: tNav("certificates"), href: "/certificates" },
          { label: tNav("leaderboard"), href: "/leaderboard" },
        ]}
      />

      {/* XP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total XP Hero */}
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 rounded-[2.5rem] p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Zap className="size-7 text-primary" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("totalXp")}</span>
            </div>
            <span className="text-6xl font-black text-foreground">{totalXp.toLocaleString()}</span>
            <span className="text-sm font-bold text-muted-foreground">XP</span>

            {/* Milestone progress bar */}
            {nextMilestone && (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>{prevMilestone?.label ?? "Start"}</span>
                  <span>{nextMilestone.label} ({nextMilestone.threshold} XP)</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                    style={{ width: `${mileProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {nextMilestone.threshold - totalXp} XP to {nextMilestone.label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><Trophy className="size-5" /></div>
            <div>
              <p className="text-2xl font-black text-foreground">{unlockedCount}/{BADGE_CONFIG.length}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("badgesTitle")}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500"><Star className="size-5" /></div>
            <div>
              <p className="text-2xl font-black text-foreground">{streak}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("currentStreak")} {t("days")}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><TrendingUp className="size-5" /></div>
            <div>
              <p className="text-2xl font-black text-foreground">{totalLessons}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("lessonsCompleted")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-foreground">{t("badgesTitle")}</h2>
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

      {/* XP Transaction Log */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-foreground">{t("xpHistoryTitle")}</h2>
        {user.xpTransactions && user.xpTransactions.length > 0 ? (
          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm divide-y divide-border/50">
            {user.xpTransactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-8 py-5 hover:bg-muted/20 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{formatXpReason(tx.reason)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                  +{tx.amount} XP
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-[3rem] gap-4">
            <Zap size={48} className="text-muted-foreground/30" />
            <p className="font-bold text-foreground uppercase tracking-widest">{t("noXpYet")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
