import { db } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { ChevronLeft, HelpCircle, Plus } from "lucide-react";
import Link from "next/link";
import { ensureQuizExists } from "@/actions/quiz-builder";
import { QuizManager } from "./QuizManager";
import { tDb } from "@/lib/i18n/db-helper";

type QuizBuilderPageProps = {
  params: Promise<{ id: string; lessonId: string }>;
};

export default async function QuizBuilderPage({ params }: QuizBuilderPageProps) {
  const { id, lessonId } = await params;
  const locale = await getLocale();

  const lesson = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.id, lessonId),
  });

  if (!lesson || lesson.type !== 'quiz') {
    redirect(`/${locale}/studio/courses/${id}/edit/curriculum` as any);
  }

  const quiz = await ensureQuizExists(lessonId);
  
  const quizData = await db.query.quizzes.findFirst({
    where: (q, { eq }) => eq(q.id, quiz.id),
    with: {
      questions: {
        orderBy: (q, { asc }) => [asc(q.order)],
        with: {
          choices: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">
      <nav className="flex items-center justify-between">
        <Link 
          href={`/${locale}/studio/courses/${id}/edit/lessons/${lessonId}` as any}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Detail Materi
        </Link>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-8">
        <div className="flex items-center gap-4">
           <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">
              <HelpCircle className="size-8" />
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Quiz Builder</h1>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {tDb(lesson.title, locale)}
              </p>
           </div>
        </div>
      </header>

      <QuizManager courseId={id} quizId={quiz.id} initialQuestions={quizData?.questions || []} locale={locale} />
    </div>
  );
}
