import { db } from "@/lib/db";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Layers, Plus, BookOpen, Video, FileText, HelpCircle, Trash2, Edit2, GripVertical } from "lucide-react";
import { CurriculumEditor } from "./CurriculumEditor";

type CurriculumPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("studio");

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: {
      modules: {
        orderBy: (m, { asc }) => [asc(m.order)],
        with: {
          lessons: {
            orderBy: (l, { asc }) => [asc(l.order)],
          },
        },
      },
    },
  });

  if (!course) {
    redirect(`/${locale}/studio/courses`);
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-xl font-black uppercase tracking-tight">{t("courseCurriculum")}</h2>
           <p className="text-xs text-muted-foreground font-medium">{t("curriculumSubtitle")}</p>
        </div>
      </header>

      <CurriculumEditor courseId={id} initialModules={course.modules} locale={locale} />
    </div>
  );
}
