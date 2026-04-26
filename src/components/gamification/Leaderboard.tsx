"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Flame, Star, Crown } from "lucide-react";
import { getGlobalLeaderboard } from "@/actions/gamification";

type LeaderboardEntry = {
  id: string;
  name: string;
  image: string | null;
  xp: number;
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getGlobalLeaderboard(50);
      setEntries(data as any);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Hall of Fame
        </h2>
      </div>

      <div className="grid gap-3">
        {entries.map((entry, index) => {
          const isTop3 = index < 3;
          const rankColor = index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-600" : "text-muted-foreground";
          const bgEffect = index === 0 ? "bg-yellow-500/5 border-yellow-500/20" : index === 1 ? "bg-slate-500/5 border-slate-500/20" : index === 2 ? "bg-amber-500/5 border-amber-500/20" : "bg-card/50";

          return (
            <div 
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] ${bgEffect} ${isTop3 ? "shadow-lg shadow-primary/5" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 text-center font-black text-lg ${rankColor}`}>
                  {index === 0 ? <Crown className="size-6 mx-auto" /> : index + 1}
                </div>
                <div className="relative">
                  <img 
                    src={entry.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.id}`} 
                    alt={entry.name}
                    className="size-12 rounded-full border-2 border-background shadow-sm"
                  />
                  {index === 0 && <div className="absolute -top-1 -right-1 size-4 bg-yellow-500 rounded-full border-2 border-background flex items-center justify-center"><Star className="size-2 text-white fill-current" /></div>}
                </div>
                <div>
                  <p className="font-bold tracking-tight">{entry.name}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 flex items-center gap-1">
                     <Flame className="size-3 text-orange-500" />
                     Level {Math.floor(entry.xp / 100) + 1}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black tracking-tighter text-primary">{entry.xp.toLocaleString()}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground/40">Total XP</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
