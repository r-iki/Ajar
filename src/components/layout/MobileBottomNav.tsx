"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LayoutGrid, BookOpen, Bell, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { id: "dashboard",    icon: LayoutGrid, href: "/dashboard",     label: "Home" },
  { id: "courses",      icon: BookOpen,   href: "/my-courses",    label: "Courses" },
  { id: "notif",        icon: Bell,       href: "/notifications", label: "Notif" },
  { id: "settings",     icon: Settings,   href: "/settings",      label: "Settings" },
  { id: "profile",      icon: User,       href: "/settings",      label: "Me" },
];

export default function MobileBottomNav({ user }: { user: any }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.includes(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />

      <div className="relative flex items-center justify-around px-2 py-2 safe-area-bottom">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            isActive("/dashboard") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" : "text-muted-foreground"
          )}>
            <LayoutGrid size={20} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </Link>

        {/* Courses */}
        <Link
          href="/my-courses"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
            isActive("/my-courses") || isActive("/certificates") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            isActive("/my-courses") || isActive("/certificates") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" : "text-muted-foreground"
          )}>
            <BookOpen size={20} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Courses</span>
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all relative",
            isActive("/notifications") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all relative",
            isActive("/notifications") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" : "text-muted-foreground"
          )}>
            <Bell size={20} />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Notif</span>
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
            isActive("/settings") || isActive("/transactions") || isActive("/subscriptions") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-all",
            isActive("/settings") || isActive("/transactions") || isActive("/subscriptions") ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" : "text-muted-foreground"
          )}>
            <Settings size={20} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Settings</span>
        </Link>

        {/* Avatar / Profile */}
        <Link
          href="/settings?tab=profile"
          className="flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-muted-foreground" />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Me</span>
        </Link>
      </div>
    </nav>
  );
}
