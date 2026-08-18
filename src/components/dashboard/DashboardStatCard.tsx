import React from "react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color: "blue" | "emerald" | "amber" | "purple";
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ title, value, description, icon: Icon, color }) => {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-6 group hover:border-neutral-700 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-black text-white">{value}</span>
          <span className="text-sm font-bold text-neutral-300">{title}</span>
        </div>
        <div className={cn("p-3 rounded-2xl border transition-transform group-hover:scale-110", colorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default DashboardStatCard;
