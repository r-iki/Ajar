import { db } from "@/lib/db";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { EditCourseForm } from "./EditCourseForm";
import { CourseThumbnailUploader } from "@/components/studio/CourseThumbnailUploader";

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("studio");

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!course) {
    redirect(`/${locale}/studio/courses`);
  }

  const categories = await db.query.categories.findMany();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
      <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
        <h2 className="mb-8 text-xl font-black uppercase tracking-tight">{t("basicInfo")}</h2>
        <EditCourseForm course={course} categories={categories} locale={locale} />
      </section>

      <aside className="space-y-8">
        <CourseThumbnailUploader
          courseId={course.id}
          currentThumbnail={course.thumbnail}
        />
      </aside>
    </div>
  );
}

