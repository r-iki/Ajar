"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { 
  LayoutGrid, 
  GraduationCap, 
  FileText, 
  Settings,
  LogOut,
  Bell,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function SlimSidebar() {
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const switchLocale = locale === "id" ? "en" : "id";

  const sections = [
    { id: "dashboard",    icon: LayoutGrid,     href: "/dashboard",       label: tNav("dashboard") },
    { id: "courses",      icon: GraduationCap,  href: "/my-courses",      label: tNav("myCourses") },
    { id: "billing",      icon: FileText,       href: "/transactions",    label: tNav("transactions") },
    { id: "notifications",icon: Bell,           href: "/notifications",   label: tNav("notifications") },
    { id: "settings",     icon: Settings,       href: "/settings",        label: tNav("settings") },
  ];

  const sectionPaths: Record<string, string[]> = {
    dashboard:    ["/dashboard"],
    courses:      ["/my-courses", "/certificates", "/leaderboard", "/showcases", "/reviews"],
    billing:      ["/transactions", "/subscriptions"],
    notifications:["/notifications"],
    settings:     ["/settings"],
  };

  const isActive = (sectionId: string) =>
    sectionPaths[sectionId]?.some((p) => pathname.includes(p)) ?? false;

  return (
    <div className="w-[72px] h-screen bg-card border-r border-border flex flex-col items-center py-6 gap-6 justify-between">
      {/* Top section: Logo + Main Nav */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo */}
        <Link href="/dashboard" className="w-10 h-10 rounded-xl overflow-hidden shrink-0 hover:scale-110 transition-transform shadow-md">
          <Image src="/favicon.jpg" alt="Ajar Logo" width={40} height={40} className="w-full h-full object-cover" />
        </Link>

        {/* Nav Icons */}
        <nav className="flex flex-col gap-2">
          {sections.map((section) => {
            const active = isActive(section.id);
            return (
              <Link
                key={section.id}
                href={section.href}
                title={section.label}
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center transition-all group relative",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <section.icon size={20} />
                {/* Tooltip */}
                <div className="absolute left-14 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0 duration-200">
                  {section.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Language Switcher + Theme Toggle + Sign Out */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Language Switcher */}
        <Link
          href={pathname}
          locale={switchLocale}
          className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-[10px] font-black uppercase text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all group relative border border-border/60"
        >
          <Languages className="size-3.5 mb-0.5" />
          <span>{switchLocale}</span>
          {/* Tooltip */}
          <div className="absolute left-14 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0 duration-200">
            {locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
          </div>
        </Link>

        {/* Theme Toggle (Dark / Light Mode) */}
        <div className="group relative flex items-center justify-center">
          <ThemeToggle />
          <div className="absolute left-14 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0 duration-200">
            {locale === "id" ? "Ganti Tema" : "Toggle Theme"}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => authClient.signOut()}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group relative"
        >
          <LogOut size={18} />
          {/* Tooltip */}
          <div className="absolute left-14 px-3 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0 duration-200">
            {tNav("signOut")}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
          </div>
        </button>
      </div>
    </div>
  );
}
