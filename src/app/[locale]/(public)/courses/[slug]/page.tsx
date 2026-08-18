import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/actions/course";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { Curriculum } from "@/components/course/Curriculum";
import { CourseReviews } from "@/components/course/CourseReviews";
import { FreeEnrollButton } from "@/components/payment/FreeEnrollButton";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PlayCircle, CheckCircle, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { tDb } from "@/lib/i18n/db-helper";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

type CourseDetailProps = {
  params: Promise<{ slug: string; locale: string }>;
};

const ABSTRACT_PLACEHOLDER = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";

export async function generateMetadata({ params }: CourseDetailProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) return { title: "Course Not Found" };

  const title = tDb(course.title, locale);
  const description = course.metaDescription || tDb(course.description, locale);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
  const { slug, locale } = await params;
  const t = await getTranslations("courses");
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const session = await getSession();

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
  const isPendingApproval = enrollment?.paymentStatus === "pending";
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {course.level}
          </span>
          <span className="text-xs text-muted-foreground">• {t("lessonsCount", { count: totalLessons })}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {tDb(course.title, locale)}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {tDb(course.description, locale)}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-12">
          <div className="aspect-video overflow-hidden rounded-2xl border bg-muted/40 shadow-2xl relative group">
            <Image 
              src={course.thumbnail || ABSTRACT_PLACEHOLDER} 
              alt={tDb(course.title, locale)} 
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
            <h2 className="text-2xl font-bold">{t("aboutCourse")}</h2>
            <div className="mt-4 leading-relaxed text-muted-foreground">
              {tDb(course.description, locale)}
            </div>
          </article>

          <Curriculum 
            modules={course.modules as any} 
            isEnrolled={isEnrolled} 
            courseSlug={course.slug} 
          />

          <div className="pt-12">
            <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />
          </div>
        </div>

        <aside id="enroll-section" className="sticky top-24 h-fit space-y-6">
          <div className="rounded-2xl border glass p-6 shadow-xl">
            <div className="mb-6 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("specialPrice")}</p>
              <p className="text-3xl font-black text-primary font-mono">
                {course.price === "0" ? t("free") : `IDR ${Number(course.price).toLocaleString()}`}
              </p>
            </div>
            
            <div className="space-y-3">
              {isEnrolled ? (
                <Link
                  href={`/learn/${course.slug}/${course.modules[0]?.lessons[0]?.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-green-700 shadow-md shadow-green-600/20"
                >
                  <CheckCircle className="size-4" />
                  {t("continueLearning")}
                </Link>
              ) : isPendingApproval ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-xs uppercase tracking-wider">
                    <Clock className="size-4 animate-pulse" />
                    <span>{t("awaitingApproval")}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {t("pendingApprovalBanner")}
                  </p>
                </div>
              ) : (
                <>
                  <FreeEnrollButton 
                    courseId={course.id} 
                    isManualApproval={course.enrollmentType === "manual"} 
                  />
                  {Number(course.price) > 0 && (
                    <PaymentModal 
                      courseId={course.id}
                      courseTitle={tDb(course.title, locale)} 
                      price={Number(course.price)} 
                      currency={course.currency}
                    />
                  )}
                </>
              )}
            </div>
            
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">✓ {t("lifetimeAccess")}</li>
              <li className="flex items-center gap-2">✓ {t("completionCert")}</li>
              <li className="flex items-center gap-2">✓ {t("discussionForum")}</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
