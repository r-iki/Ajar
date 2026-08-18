import { getCourses, getCategories } from "@/actions/course";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CourseFilter } from "@/components/course/CourseFilter";
import { BookOpen, Users, Star, ArrowRight } from "lucide-react";
import { tDb } from "@/lib/i18n/db-helper";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");

  return {
    title: `${t("catalogTitle")} | Ajar`,
    description: t("catalogSubtitle"),
  };
}

const ABSTRACT_PLACEHOLDER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";

import Image from "next/image";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; level?: string; search?: string }>;
}) {
  const params = await searchParams;
  const allCourses = await getCourses(params);
  const categories = await getCategories();
  const locale = await getLocale();
  const t = await getTranslations("courses");

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t("catalogTitle")}</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            {t("catalogSubtitle")}
          </p>
        </div>
      </header>

      <CourseFilter categories={categories} />

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {allCourses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-[3rem] border-2 border-dashed bg-muted/10">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="size-8 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold">{t("noCourses")}</p>
            </div>
          </div>
        ) : (
          allCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="group">
              <article className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                  <Image 
                    src={course.thumbnail || ABSTRACT_PLACEHOLDER} 
                    alt={tDb(course.title, locale)} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary shadow-lg">
                      {course.level}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-lg">
                      {course.category ? tDb(course.category.name, locale) : "Uncategorized"}
                    </span>
                  </div>
                  
                  <h2 className="line-clamp-2 text-xl font-black leading-tight group-hover:text-primary transition-colors mb-6 min-h-[3.5rem]">
                    {tDb(course.title, locale)}
                  </h2>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-dashed pt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {locale === "id" ? "Investasi" : "Investment"}
                      </span>
                      <span className="text-lg font-black text-primary">
                        {course.price === "0" ? t("free") : `IDR ${Number(course.price).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:scale-110 group-active:scale-95">
                      <ArrowRight className="size-5" />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
