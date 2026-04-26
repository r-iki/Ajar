"use client";

import { useLocale, useTranslations } from "next-intl";
import { User, LogOut, Settings, LayoutDashboard, Languages } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const switchLocale = locale === "id" ? "en" : "id";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary transition-transform hover:scale-105">
          {t("brand")}
        </Link>

        <nav className="flex items-center gap-6">
          <div className="hidden items-center gap-4 text-sm font-medium md:flex">
            <Link href="/courses" className="text-muted-foreground transition-colors hover:text-primary">
              Courses
            </Link>
            {session && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`transition-colors hover:text-primary ${pathname.includes("/dashboard") ? "text-primary font-bold" : "text-muted-foreground"}`}
                >
                  Dashboard
                </Link>
                {(session.user.role === "instructor" || session.user.role === "admin") && (
                  <Link href="/studio/courses" className="text-muted-foreground transition-colors hover:text-primary">
                    Studio
                  </Link>
                )}
                {session.user.role === "admin" && (
                  <Link href="/overview" className="text-muted-foreground transition-colors hover:text-primary">
                    Admin
                  </Link>
                )}
              </>
            )}
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

            {!isPending && (
              <>
                {session ? (
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/account"
                      className="group flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 transition-all hover:border-primary"
                    >
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                      )}
                    </Link>
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
    </header>
  );
}
