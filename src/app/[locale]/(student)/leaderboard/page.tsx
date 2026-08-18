import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Metadata } from "next";
import SectionTabBar from "@/components/layout/SectionTabBar";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations("nav");
  return {
    title: `${tNav("leaderboard")} | Ajar`,
    description: "Top learners and global achievements on Ajar LMS.",
  };
}

export default async function LeaderboardPage() {
  const tNav = await getTranslations("nav");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <span className="text-xs font-black uppercase tracking-widest">{tNav("leaderboard")}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">{tNav("leaderboard")}</h1>
        <p className="text-muted-foreground font-medium">Kumpulkan XP dan raih peringkat teratas di komunitas Ajar.</p>
      </header>

      <SectionTabBar tabs={[
        { label: tNav("myCourses"), href: "/my-courses" },
        { label: tNav("certificates"), href: "/certificates" },
        { label: tNav("leaderboard"), href: "/leaderboard" },
      ]} />

      <div className="max-w-3xl mx-auto w-full">
        <Leaderboard />
      </div>
    </div>
  );
}
