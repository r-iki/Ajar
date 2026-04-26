import { db } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Settings, BookOpen, Layers, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function CourseEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!course) {
    redirect(`/${locale}/studio/courses`);
  }

  const tabs = [
    { name: "Informasi Dasar", href: `/studio/courses/${id}/edit`, icon: Settings },
    { name: "Kurikulum", href: `/studio/courses/${id}/edit/curriculum`, icon: Layers },
    { name: "Settings", href: `/studio/courses/${id}/edit/settings`, icon: BookOpen },
  ];

  return (
    <div className="space-y-8 pb-20">
      <nav className="flex items-center justify-between">
        <Link 
          href={`/${locale}/studio/courses`}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Studio
        </Link>
        <div className="flex items-center gap-4">
           <Link 
             href={`/${locale}/courses/${course.slug}`}
             target="_blank"
             className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-muted transition-all"
           >
             <Eye className="size-4" />
             Pratinjau
           </Link>
        </div>
      </nav>

      <header className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight">{locale === 'id' ? course.titleId : course.titleEn}</h1>
        
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={`/${locale}${tab.href}`}
              className="flex items-center gap-2 rounded-2xl border bg-card px-5 py-3 text-sm font-black transition-all hover:border-primary/50 hover:bg-primary/5"
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
