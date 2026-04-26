import { db } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { ChevronLeft, Save, Video, FileText, HelpCircle, Clock } from "lucide-react";
import Link from "next/link";
import { LessonForm } from "./LessonForm";

type EditLessonPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id, lessonId } = await params;
  const locale = await getLocale();

  const lesson = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.id, lessonId),
  });

  if (!lesson) {
    redirect(`/${locale}/studio/courses/${id}/edit/curriculum`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">
      <nav className="flex items-center justify-between">
        <Link 
          href={`/${locale}/studio/courses/${id}/edit/curriculum`}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Kurikulum
        </Link>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-8">
        <div className="flex items-center gap-4">
           <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              {lesson.type === 'video' && <Video className="size-8" />}
              {lesson.type === 'article' && <FileText className="size-8" />}
              {lesson.type === 'quiz' && <HelpCircle className="size-8" />}
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">
                {locale === 'id' ? lesson.titleId : lesson.titleEn}
              </h1>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Edit {lesson.type} • {id}
              </p>
           </div>
        </div>
      </header>

      <LessonForm lesson={lesson} courseId={id} locale={locale} />
    </div>
  );
}
