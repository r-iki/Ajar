import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SettingsClient from "@/components/user/SettingsClient";
import { Settings, User, Briefcase, Share2, Shield } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("student");
  const tNav = await getTranslations("nav");
  const session = await getSession();

  if (!session?.user) {
    redirect(`/${locale}/sign-in`);
  }

  const tabs = [
    { id: "profile",  label: t("tabProfile"), icon: User },
    { id: "personal", label: t("tabPersonal"), icon: Briefcase },
    { id: "social",   label: t("tabSocial"),   icon: Share2 },
    { id: "security", label: t("tabSecurity"), icon: Shield },
  ];

  const { tab = "profile" } = await searchParams;
  const activeTab = tabs.some(item => item.id === tab) ? tab : "profile";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
           <Settings size={16} />
           <span className="text-xs font-black uppercase tracking-widest">{tNav("settings")}</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">{t("settings")}</h1>
        <p className="text-muted-foreground font-medium">{t("settings")}</p>
      </header>

      {/* Tab Navigation */}
      <div className="relative">
        <div className="bg-card border border-border rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide backdrop-blur-sm shadow-sm">
          {tabs.map((item) => (
            <Link
              key={item.id}
              href={`/settings?tab=${item.id}`}
              className={cn(
                "flex items-center gap-2 px-4 md:px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </div>
        {/* Scroll fade hint — mobile only */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none rounded-r-2xl md:hidden" />
      </div>

      <SettingsClient session={session} />
    </div>
  );
}
