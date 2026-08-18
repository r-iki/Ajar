import { db } from "@/lib/db";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Settings, BookOpen, Layers, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { tDb } from "@/lib/i18n/db-helper";

export default async function CourseEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("studio");
  
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!course) {
    redirect(`/${locale}/studio/courses`);
  }

  const tabs = [
    { name: t("basicInfo"), href: `/studio/courses/${id}/edit`, icon: Settings },
    { name: t("curriculum"), href: `/studio/courses/${id}/edit/curriculum`, icon: Layers },
    { name: t("saveChanges"), href: `/studio/courses/${id}/edit/settings`, icon: BookOpen },
  ];

  return (
    <div className="space-y-8 pb-20">
      <nav className="flex items-center justify-between">
        <Link 
          href={`/${locale}/studio/courses`}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft className="size-4" />
          {t("backToStudio")}
        </Link>
        <div className="flex items-center gap-4">
           <Link 
             href={`/${locale}/courses/${course.slug}`}
             target="_blank"
             className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted transition-all shadow-xs"
           >
             <Eye className="size-4" />
             {t("preview")}
           </Link>
        </div>
      </nav>

      <header className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight">{tDb(course.title, locale)}</h1>
        
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={`/${locale}${tab.href}`}
              className="flex items-center gap-2 rounded-2xl border bg-card px-5 py-3 text-sm font-black transition-all hover:border-primary/50 hover:bg-primary/5 shadow-xs"
            >
              <tab.icon className="size-4" />
              {tab.name}
            </Link>
          ))}
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}
