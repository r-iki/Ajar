"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Bell, 
  Wallet, 
  CreditCard, 
  Bookmark, 
  Code, 
  Link as LinkIcon,
  ChevronRight,
  Settings,
  Award,
  Star,
  Users,
  Trophy,
  LayoutGrid,
  Share2,
  ShoppingCart,
  FileText,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export default function StudentSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  // Define sidebar configurations for different sections
  const sections: Record<string, { title: string; groups: SidebarGroup[] }> = {
    dashboard: {
      title: "Dashboard",
      groups: [
        {
          title: "Overview",
          items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Notifications", href: "/notifications", icon: Bell, badge: 1 },
            { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
          ],
        },
      ],
    },
    courses: {
      title: "My Courses",
      groups: [
        {
          title: "Overview",
          items: [
            { label: "My Courses", href: "/my-courses", icon: BookOpen },
            { label: "Certificates", href: "/certificates", icon: Award },
            { label: "Showcases", href: "/showcases", icon: LayoutGrid },
            { label: "Reviews", href: "/reviews", icon: Star },
            { label: "Leaderboards", href: "/leaderboard", icon: Trophy },
          ],
        },
      ],
    },
    transactions: {
      title: "Transactions",
      groups: [
        {
          title: "Carts",
          items: [
            { label: "My Carts", href: "/transactions/carts", icon: ShoppingCart },
          ],
        },
        {
          title: "Transactions",
          items: [
            { label: "Courses", href: "/transactions", icon: FileText },
            { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
          ],
        },
      ],
    },
    utilities: {
      title: "Utilities",
      groups: [
        {
          title: "Resources",
          items: [
            { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
            { label: "Snippets Code", href: "/snippets", icon: Code },
            { label: "ShortLinks", href: "/links", icon: LinkIcon },
          ],
        },
      ],
    },
    settings: {
      title: "Settings",
      groups: [
        {
          title: "My Account",
          items: [
            { label: "My Settings", href: "/settings", icon: Settings },
            { label: "Transactions", href: "/transactions", icon: FileText },
            { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
          ],
        },
      ],
    },
  };

  // Determine which section to show
  let activeSection = "dashboard";
  if (pathname.includes("/my-courses") || pathname.includes("/leaderboard") || pathname.includes("/showcases") || pathname.includes("/reviews") || pathname.includes("/certificates")) {
    activeSection = "courses";
  } else if (pathname.includes("/transactions") || pathname.includes("/subscriptions")) {
    activeSection = "transactions";
  } else if (pathname.includes("/bookmarks") || pathname.includes("/snippets") || pathname.includes("/links")) {
    activeSection = "utilities";
  } else if (pathname.includes("/settings")) {
    activeSection = "settings";
  }

  const currentSection = sections[activeSection];

  return (
    <aside className="w-64 h-screen bg-black border-r border-neutral-900 flex flex-col p-6 gap-8">
      {/* Section Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-black text-white tracking-tight uppercase">{currentSection.title}</h2>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 flex flex-col gap-8">
        {currentSection.groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">
              {group.title}
            </h3>
            <nav className="flex flex-col gap-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all group",
                      isActive 
                        ? "bg-neutral-900 text-white ring-1 ring-neutral-800 shadow-2xl" 
                        : "text-neutral-500 hover:text-white hover:bg-neutral-900/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl transition-all",
                        isActive ? "bg-white text-black" : "bg-neutral-900 text-neutral-500 group-hover:text-white"
                      )}>
                        <item.icon size={18} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-2 py-0.5 bg-blue-500 text-[8px] font-black text-white rounded-full">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight 
                        size={14} 
                        className={cn(
                          "transition-transform",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                        )} 
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Mini Profile */}
      <div className="mt-auto p-4 bg-neutral-950 border border-neutral-900 rounded-3xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-neutral-800 overflow-hidden border border-neutral-700">
          {user.image && <img src={user.image} alt={user.name} className="w-full h-full object-cover" />}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-black text-white truncate">{user.name}</span>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest truncate">
             {user.username ? `@${user.username}` : (user.role || 'Student')}
          </span>
        </div>
      </div>
    </aside>
  );
}
