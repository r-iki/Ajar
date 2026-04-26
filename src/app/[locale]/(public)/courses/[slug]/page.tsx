import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/actions/course";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { Curriculum } from "@/components/course/Curriculum";
import { FreeEnrollButton } from "@/components/payment/FreeEnrollButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PlayCircle, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

type CourseDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailPage({ params }: CourseDetailProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let enrollment = null;
  if (session?.user) {
    enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, session.user.id),
        eq(enrollments.courseId, course.id)
      ),
    });
  }

  const isEnrolled = enrollment?.paymentStatus === "paid";
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {course.level}
          </span>
          <span className="text-xs text-muted-foreground">• {totalLessons} Lessons</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {course.titleId}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {course.descId}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-12">
          <div className="aspect-video overflow-hidden rounded-3xl border bg-muted/40 shadow-2xl">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.titleId} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground/30 text-center p-10">
                <div className="size-20 rounded-full border-4 border-dashed border-current flex items-center justify-center">
                  <PlayCircle className="size-10" />
                </div>
                <div>
                  <span className="block font-bold text-lg text-muted-foreground/50">Preview Video Belum Tersedia</span>
                  <span className="text-sm">Video intro sedang dalam proses produksi</span>
                </div>
              </div>
            )}
          </div>
          
          <article className="prose prose-invert max-w-none rounded-3xl border glass p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Tentang Kursus Ini</h2>
            <div className="mt-4 leading-relaxed text-muted-foreground">
              {course.descId}
            </div>
          </article>

          <Curriculum modules={course.modules as any} />
        </div>

        <aside className="sticky top-24 h-fit space-y-6">
          <div className="rounded-3xl border glass p-6 shadow-xl">
            <div className="mb-6 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Harga Spesial</p>
              <p className="text-3xl font-black text-primary">
                {course.price === "0" ? "GRATIS" : `IDR ${Number(course.price).toLocaleString()}`}
              </p>
            </div>
            
            <div className="space-y-3">
              {isEnrolled ? (
                <Link
                  href={`/learn/${course.slug}/${course.modules[0]?.lessons[0]?.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-green-700"
                >
                  <CheckCircle className="size-4" />
                  Lanjut Belajar
                </Link>
              ) : (
                <>
                  <FreeEnrollButton courseId={course.id} />
                  {Number(course.price) > 0 && (
                    <PaymentModal 
                      courseId={course.id}
                      courseTitle={course.titleId} 
                      price={Number(course.price)} 
                      currency={course.currency}
                    />
                  )}
                </>
              )}
            </div>
            
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">✓ Akses seumur hidup</li>
              <li className="flex items-center gap-2">✓ Sertifikat penyelesaian</li>
              <li className="flex items-center gap-2">✓ Forum diskusi</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
