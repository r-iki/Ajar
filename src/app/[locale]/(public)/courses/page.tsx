import { getCourses } from "@/actions/course";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";

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

export default async function CoursesPage() {
  const allCourses = await getCourses();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Katalog Kursus</h1>
        <p className="text-muted-foreground">Temukan kursus terbaik untuk meningkatkan skill IT kamu.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allCourses.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground">Belum ada kursus yang tersedia.</p>
          </div>
        ) : (
          allCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`}>
              <article className="group h-full overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl hover:border-primary/20">
                <div className="aspect-video w-full bg-muted/30 relative overflow-hidden">
                  <img 
                    src={course.thumbnail || "/images/course-placeholder.png"} 
                    alt={course.titleId} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {course.level}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                    {course.titleId}
                  </h2>
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="font-bold text-primary">
                      {course.price === "0" ? "FREE" : `IDR ${Number(course.price).toLocaleString()}`}
                    </span>
                    <div className="rounded-lg bg-muted px-3 py-1.5 text-xs font-bold transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      Detail
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
