"use client";

import { useLocale, useTranslations } from "next-intl";
import { User, LogOut, Settings, LayoutDashboard, Languages, Trophy, Zap, Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function Navbar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const switchLocale = locale === "id" ? "en" : "id";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  if (session) {
    const user = session.user as any;
    navLinks.push({ href: "/dashboard", label: "Dashboard" });
    if (user.role === "instructor" || user.role === "admin") {
      navLinks.push({ href: "/studio/courses", label: "Studio" });
    }
    if (user.role === "admin") {
      navLinks.push({ href: "/overview", label: "Admin" });
    }
  }

  return (
    <header className={`sticky top-0 w-full border-b glass transition-all ${isMenuOpen ? "z-[100]" : "z-50"}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary transition-transform hover:scale-105">
          {t("brand")}
        </Link>

        <nav className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-1.5 transition-colors hover:text-primary ${pathname.includes(link.href) ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {link.icon && <link.icon className="size-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 border-l pl-3">
            <Link
              href={pathname}
              locale={switchLocale}
              className="flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-muted"
            >
              <Languages className="size-3" />
              {switchLocale}
            </Link>

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted md:hidden"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {!isPending && (
              <>
                {session ? (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Link 
                        href="/account/settings"
                        className="group flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 transition-all hover:border-primary shadow-sm"
                      >
                        {session.user.image ? (
                          <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                        )}
                      </Link>
                      
                      {/* XP Badge on Avatar */}
                      <div className="absolute -right-2 -top-1.5 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black text-primary-foreground shadow-lg ring-2 ring-background">
                        <Zap className="size-2 fill-current" />
                        {(session.user as any).xp || 0}
                      </div>
                    </div>

                    <button 
                      onClick={handleSignOut}
                      className="hidden items-center gap-1 text-xs font-bold text-destructive hover:underline md:flex"
                    >
                      <LogOut className="size-3" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/sign-in" 
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 md:hidden">
          {/* Backdrop Blur Layer */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content Container */}
          <div className="relative p-6 pt-[70px] animate-in slide-in-from-top-4 duration-300 pointer-events-none">
            <div 
              className="flex flex-col space-y-3 bg-card/95 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${pathname.includes(link.href) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 hover:bg-muted"}`}
                >
                  {link.icon ? <link.icon className="size-5" /> : <LayoutDashboard className="size-5" />}
                  <span className="font-bold">{link.label}</span>
                </Link>
              ))}
              
              {session && (
                <>
                  <Link 
                    href="/account/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${pathname.includes('/account/settings') ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 hover:bg-muted"}`}
                  >
                    <Settings className="size-5" />
                    <span className="font-bold">Account Settings</span>
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-4 rounded-2xl border bg-destructive/10 text-destructive font-bold text-left hover:bg-destructive/20 transition-all"
                  >
                    <LogOut className="size-5" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
