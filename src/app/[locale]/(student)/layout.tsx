import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import SlimSidebar from "@/components/layout/SlimSidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const locale = await getLocale();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Slim Icon Sidebar — desktop only */}
      <div className="hidden md:block shrink-0">
        <SlimSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-background p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav user={session.user} />
    </div>
  );
}
