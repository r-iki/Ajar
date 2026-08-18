"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  href: string;
  /** Optional: match additional path prefixes as active */
  matchPaths?: string[];
}

interface SectionTabBarProps {
  tabs: TabItem[];
  /** Optional section title above the tab bar */
  sectionLabel?: string;
}

export default function SectionTabBar({ tabs, sectionLabel }: SectionTabBarProps) {
  const pathname = usePathname();

  return (
    <div className="relative mb-6">
      {sectionLabel && (
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3">
          {sectionLabel}
        </p>
      )}

      {/* Scrollable tab pill row */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide bg-muted/60 border border-border rounded-2xl p-1.5 backdrop-blur-sm">
        {tabs.map((tab, index) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "?") ||
            tab.matchPaths?.some((p) => pathname.includes(p));

          return (
            <Link
              key={`${tab.href}-${tab.label}-${index}`}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Right fade hint — mobile only */}
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none rounded-r-2xl md:hidden" />
    </div>
  );
}
