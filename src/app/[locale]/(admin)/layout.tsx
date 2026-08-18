import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";
import { LayoutDashboard, Users } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const locale = await getLocale();

  if (!session) {
    redirect(`/${locale}/sign-in` as any);
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard` as any);
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pt-8">
        {/* Admin Sub Nav */}
        <nav className="flex gap-1 border-b pb-0 mb-8">
          {[
            { href: "/overview", label: "Overview", icon: LayoutDashboard },
            { href: "/users", label: "Pengguna", icon: Users },
          ].map((item) => (
            <Link
              key={item.href}
              href={`/overview`.replace("/overview", item.href) as any}
              className="flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-primary/50 transition-all"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
