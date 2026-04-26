import { getCourses } from "@/actions/course";
import { Link } from "@/i18n/navigation";

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
            <article key={course.id} className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg">
              <div className="aspect-video w-full bg-muted/50">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.titleId} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/20">
                    No Image
                  </div>
                )}
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
                  <Link 
                    href={`/courses/${course.slug}`} 
                    className="rounded-lg bg-muted px-3 py-1.5 text-xs font-bold transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
