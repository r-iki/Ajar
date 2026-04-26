import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/actions/course";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { Curriculum } from "@/components/course/Curriculum";
import { CourseReviews } from "@/components/course/CourseReviews";
import { FreeEnrollButton } from "@/components/payment/FreeEnrollButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PlayCircle, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";

import Image from "next/image";

type CourseDetailProps = {
  params: Promise<{ slug: string; locale: string }>;
};

const ABSTRACT_PLACEHOLDER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";

export async function generateMetadata({ params }: CourseDetailProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) return { title: "Course Not Found" };

  const title = locale === "id" ? course.titleId : course.titleEn;
  const description = course.metaDescription || (locale === "id" ? course.descId : course.descEn);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ajar.com';
  const imageUrl = course.thumbnail || ABSTRACT_PLACEHOLDER;

  return {
    title: `${title} | Ajar`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/courses/${slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

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
          <div className="aspect-video overflow-hidden rounded-2xl border bg-muted/40 shadow-2xl relative group">
            <Image 
              src={course.thumbnail || ABSTRACT_PLACEHOLDER} 
              alt={course.titleId} 
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
              sizes="(max-width: 1024px) 100vw, 800px"
            />
            {!course.thumbnail && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                <div className="text-center p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in duration-500">
                   <PlayCircle className="size-12 text-white/80 mx-auto mb-3" />
                   <p className="text-sm font-black uppercase tracking-widest text-white/90">Preview Coming Soon</p>
                </div>
              </div>
            )}
          </div>
          
          <article className="prose prose-invert max-w-none rounded-2xl border glass p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Tentang Kursus Ini</h2>
            <div className="mt-4 leading-relaxed text-muted-foreground">
              {course.descId}
            </div>
          </article>

          <Curriculum 
            modules={course.modules as any} 
            isEnrolled={isEnrolled} 
            courseSlug={course.slug} 
          />

          <div className="pt-12">
            <CourseReviews courseId={course.id} />
          </div>
        </div>

        <aside id="enroll-section" className="sticky top-24 h-fit space-y-6">
          <div className="rounded-2xl border glass p-6 shadow-xl">
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
