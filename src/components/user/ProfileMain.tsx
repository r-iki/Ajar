"use client";

import React, { useState } from "react";
import { User, Award, FolderOpen, ChevronRight, Trophy, Zap, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { tDb } from "@/lib/i18n/db-helper";
import Link from "next/link";

interface ProfileMainProps {
  user: {
    xp: number;
    position?: string | null;
    skills?: string | null;
    biography?: string | null;
    certificates?: any[];
    lessonProgress?: any[];
    xpTransactions?: any[];
    enrollments?: any[];
  };
}

type BadgeKey = "firstStep" | "onFire" | "scholar" | "courseMaster" | "xpHunter" | "diamond";

const BADGE_CONFIG: { key: BadgeKey; icon: string; nameKey: string; descKey: string }[] = [
  { key: "firstStep", icon: "🎯", nameKey: "badgeFirstStep", descKey: "badgeFirstStepDesc" },
  { key: "onFire", icon: "🔥", nameKey: "badgeOnFire", descKey: "badgeOnFireDesc" },
  { key: "scholar", icon: "📚", nameKey: "badgeScholar", descKey: "badgeScholarDesc" },
  { key: "courseMaster", icon: "🏆", nameKey: "badgeCourseMaster", descKey: "badgeCourseMasterDesc" },
  { key: "xpHunter", icon: "⚡", nameKey: "badgeXpHunter", descKey: "badgeXpHunterDesc" },
  { key: "diamond", icon: "💎", nameKey: "badgeDiamond", descKey: "badgeDiamondDesc" },
];

function calcStreak(lessonProgress: { completedAt: Date | string }[]): number {
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

const ProfileMain: React.FC<ProfileMainProps> = ({ user }) => {
  const locale = useLocale();
  const t = useTranslations("profile");
  const tS = useTranslations("student"); // reuse badge label keys from student namespace
  const [activeTab, setActiveTab] = useState<"about" | "certificates" | "badges" | "portfolio">("about");

  // --- Computed gamification ---
  const totalLessons = user.lessonProgress?.length ?? 0;
  const totalXp = user.xpTransactions?.reduce((s: number, x: any) => s + x.amount, 0) ?? user.xp ?? 0;
  const streak = calcStreak(user.lessonProgress ?? []);
  const completedCourses = user.enrollments?.filter((e: any) => e.completedAt).length ?? 0;

  const badges: Record<BadgeKey, boolean> = {
    firstStep: totalLessons >= 1,
    onFire: streak >= 3,
    scholar: totalLessons >= 10,
    courseMaster: completedCourses >= 1,
    xpHunter: totalXp >= 100,
    diamond: totalXp >= 500,
  };

  const unlockedBadges = BADGE_CONFIG.filter(b => badges[b.key]);

  const tabs = [
    { id: "about", label: t("about"), icon: User },
    { id: "certificates", label: t("certificates"), icon: Award },
    { id: "badges", label: t("badges"), icon: Star },
    { id: "portfolio", label: t("portfolio"), icon: FolderOpen },
  ];

  const calculateLevel = (xp: number) => {
    if (xp === 0) return t("noLevel");
    return Math.floor(xp / 100) + 1;
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Navigation Tabs */}
      <div className="flex justify-center md:justify-start">
        <div className="bg-card border border-border p-1 rounded-2xl flex flex-wrap gap-1 shadow-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.id === "badges" && unlockedBadges.length > 0 && (
                <span className="ml-1 bg-primary/20 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {unlockedBadges.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm min-h-[500px]">

        {/* ---- ABOUT ---- */}
        {activeTab === "about" && (
          <div className="flex flex-col gap-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("position")}</span>
                <span className="text-foreground font-semibold text-base">{user.position || t("noPosition")}</span>
                <div className="h-px bg-border/60 mt-4" />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("level")}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Trophy size={18} className="text-yellow-500" />
                  <span className="text-foreground font-bold text-base">{calculateLevel(user.xp)}</span>
                  <span className="text-xs text-muted-foreground">({totalXp} XP)</span>
                </div>
                <div className="h-px bg-border/60 mt-4" />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("skills")}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skills ? (
                    user.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-muted border border-border/80 rounded-xl text-xs font-bold text-foreground shadow-2xs">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm font-medium">{t("noSkills")}</span>
                  )}
                </div>
                <div className="h-px bg-border/60 mt-4" />
              </div>
            </div>

            {/* Biography */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t("biography")}</h3>
              <div className="bg-muted/30 border border-border rounded-2xl p-6 relative overflow-hidden">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm font-medium">
                  {user.biography || t("noBio")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---- CERTIFICATES ---- */}
        {activeTab === "certificates" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t("certificates")}</h3>
            {user.certificates && user.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.certificates.map((cert, idx) => (
                  <div key={idx} className="bg-background border border-border p-5 rounded-2xl flex flex-col gap-3 group hover:border-primary/50 transition-all shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Award className="text-primary size-5" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono font-bold">{cert.code}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{tDb(cert.course.title, locale)}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(cert.issuedAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/v/${cert.code}`}
                      className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      {t("viewCertificate")} <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 border-2 border-dashed border-border rounded-3xl">
                <Award size={48} className="opacity-20" />
                <p className="text-sm font-medium">{t("noCertificates")}</p>
              </div>
            )}
          </div>
        )}

        {/* ---- BADGES ---- */}
        {activeTab === "badges" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* XP + Streak summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/30 border border-border rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Zap size={20} className="text-primary" />
                </div>
                <p className="text-xl font-black text-foreground">{totalXp}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{t("totalXp")}</p>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <p className="text-xl font-black text-foreground">{streak}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{t("streak")}</p>
              </div>
              <div className="bg-muted/30 border border-border rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Star size={20} className="text-yellow-500" />
                </div>
                <p className="text-xl font-black text-foreground">{unlockedBadges.length}/{BADGE_CONFIG.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{t("badges")}</p>
              </div>
            </div>

            {/* Badge Grid */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4">{t("badgesTitle")}</h3>
              {unlockedBadges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BADGE_CONFIG.map(({ key, icon, nameKey, descKey }) => {
                    const earned = badges[key];
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all",
                          earned
                            ? "bg-background border-primary/30 shadow-sm"
                            : "bg-muted/10 border-border/30 opacity-40 grayscale"
                        )}
                      >
                        <span className="text-3xl">{icon}</span>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-foreground">{tS(nameKey as any)}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{tS(descKey as any)}</p>
                        </div>
                        {earned && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tS("unlocked")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-3xl gap-4 text-muted-foreground">
                  <Star size={40} className="opacity-20" />
                  <p className="text-sm font-medium">{t("noBadges")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- PORTFOLIO ---- */}
        {activeTab === "portfolio" && (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4 animate-in fade-in duration-300">
            <FolderOpen size={48} className="opacity-20" />
            <p className="text-sm font-bold uppercase tracking-wider">{t("portfolioComingSoon")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileMain;
