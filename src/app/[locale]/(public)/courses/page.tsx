import { getCourses, getCategories } from "@/actions/course";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { CourseFilter } from "@/components/course/CourseFilter";
import { BookOpen, Users, Star, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = locale === "id" ? "Katalog Kursus" : "Course Catalog";
  const description = locale === "id" 
    ? "Temukan kursus IT terbaik untuk meningkatkan skill coding kamu di Ajar."
    : "Find the best IT courses to improve your coding skills at Ajar.";

  return {
    title: `${title} | Ajar`,
    description,
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

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Katalog Kursus</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            Pilih kursus yang sesuai dengan passion dan level kamu. Belajar langsung dari ahlinya.
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
              <p className="text-xl font-bold">Kursus tidak ditemukan</p>
              <p className="text-muted-foreground">Coba gunakan kata kunci atau filter lain.</p>
            </div>
          </div>
        ) : (
          allCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="group">
              <article className="flex h-full flex-col overflow-hidden rounded-[2.5rem] border bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                  <Image 
                    src={course.thumbnail || ABSTRACT_PLACEHOLDER} 
                    alt={locale === 'id' ? course.titleId : course.titleEn} 
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
                      {course.category?.nameId || course.category?.name || "Uncategorized"}
                    </span>
                  </div>
                  
                  <h2 className="line-clamp-2 text-xl font-black leading-tight group-hover:text-primary transition-colors mb-6 min-h-[3.5rem]">
                    {locale === 'id' ? course.titleId : course.titleEn}
                  </h2>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-dashed pt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Investasi</span>
                      <span className="text-lg font-black text-primary">
                        {course.price === "0" ? "GRATIS" : `IDR ${Number(course.price).toLocaleString()}`}
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
