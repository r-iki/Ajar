import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | Ajar",
  description: "Lihat siapa yang memimpin di papan peringkat Ajar.",
};

export default function LeaderboardPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase bg-linear-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Terus belajar, kumpulkan XP, dan jadilah yang terbaik di komunitas Ajar.
        </p>
      </div>
      
      <Leaderboard />
    </div>
  );
}
