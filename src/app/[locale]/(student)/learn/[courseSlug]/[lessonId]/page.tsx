import { ProgressBar } from "@/components/course/ProgressBar";
import { ArticleRenderer } from "@/components/lesson/ArticleRenderer";
import { QuizEngine } from "@/components/lesson/QuizEngine";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { MarkCompleteButton } from "@/components/lesson/MarkCompleteButton";
import { Link } from "@/i18n/navigation";
import { getLearnData } from "@/actions/learn";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CheckCircle2, Circle, Trophy } from "lucide-react";

import { Metadata } from "next";

type LearnLessonPageProps = {
  params: Promise<{ courseSlug: string; lessonId: string; locale: string }>;
};

export async function generateMetadata({ params }: LearnLessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonId, locale } = await params;
  const data = await getLearnData(courseSlug, lessonId);

  if (!data || !data.currentLesson) return { title: "Lesson Not Found" };

  const lessonTitle = locale === "id" ? data.currentLesson.titleId : data.currentLesson.titleEn;
  const courseTitle = locale === "id" ? data.course.titleId : data.course.titleEn;

  return {
    title: `${lessonTitle} | ${courseTitle} | Ajar`,
    robots: { index: false, follow: false }, // Penting: Jangan indeks halaman belajar
  };
}

export default async function LearnLessonPage({ params }: LearnLessonPageProps) {
  const { courseSlug, lessonId } = await params;
  const locale = await getLocale();
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return notFound();
  }

  const data = await getLearnData(courseSlug, lessonId);

  if (!data || !data.currentLesson) {
    return notFound();
  }

  const { course, currentLesson, quizData, isCompleted, completedLessonIds, certificateCode } = data;

  const allLessons = course.modules.flatMap(m => m.lessons);
  const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length;
  const progress = Math.round((completedCount / allLessons.length) * 100);
  const isCourseFinished = progress === 100;
  
  // Determine Article Content with fallback
  const contentPrimary = locale === 'id' ? currentLesson.contentId : currentLesson.contentEn;
  const contentSecondary = locale === 'id' ? currentLesson.contentEn : currentLesson.contentId;
  const displayContent = contentPrimary || contentSecondary || "";

  return (
    <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-6 rounded-2xl border glass p-6 shadow-xl h-fit sticky top-24">
        <div className="space-y-3">
          <h2 className="font-black text-xl leading-tight tracking-tight">
            {locale === 'id' ? course.titleId : course.titleEn}
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>

        <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-2">
          {course.modules.map((mod) => {
            const moduleLessons = mod.lessons;
            const completedInModule = moduleLessons.filter(l => completedLessonIds.has(l.id)).length;
            const isModuleDone = completedInModule === moduleLessons.length;

            return (
              <div key={mod.id} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    {locale === 'id' ? mod.titleId : mod.titleEn}
                  </h3>
                  {isModuleDone && <CheckCircle2 className="size-3 text-blue-500" />}
                </div>
                <div className="space-y-1">
                  {mod.lessons.map((lesson) => {
                    const isLessonDone = completedLessonIds.has(lesson.id);
                    const isActive = lesson.id === currentLesson.id;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${courseSlug}/${lesson.id}`}
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all
                          ${isActive 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/50" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }
                        `}
                      >
                        <div className="shrink-0">
                          {isLessonDone ? (
                            <CheckCircle2 className={`size-4 ${isActive ? "text-primary-foreground" : "text-blue-500"}`} />
                          ) : (
                            <Circle className={`size-4 opacity-30 ${isActive ? "text-primary-foreground" : ""}`} />
                          )}
                        </div>
                        <span className="flex-1 font-semibold truncate">
                          {locale === 'id' ? lesson.titleId : lesson.titleEn}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {isCourseFinished && (
          <div className="pt-4 border-t">
            <Link
              href={`/v/${certificateCode || course.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-3 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              <Trophy className="size-4" />
              CETAK SERTIFIKAT
            </Link>
          </div>
        )}
      </aside>

      <article className="space-y-8 rounded-2xl border glass p-8 shadow-2xl min-h-[700px] flex flex-col">
        <header className="space-y-4 border-b pb-6">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary/70">
            <span className="rounded-full bg-primary/10 px-3 py-1">{currentLesson.type}</span>
            <span>•</span>
            <span>{currentLesson.duration} Menit</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight lg:text-5xl">
            {locale === 'id' ? currentLesson.titleId : currentLesson.titleEn}
          </h1>
        </header>

        <main className="flex-1">
          {currentLesson.type === "video" && currentLesson.videoUrl ? (
            <VideoPlayer url={currentLesson.videoUrl} />
          ) : null}

          {currentLesson.type === "article" && displayContent ? (
            <div className="mt-4">
              <ArticleRenderer markdown={displayContent} />
            </div>
          ) : null}

          {currentLesson.type === "quiz" && quizData ? (
            <div className="mt-4">
              <QuizEngine 
                userId={session.user.id}
                quizId={quizData.id}
                lessonId={currentLesson.id}
                questions={quizData.questions.map(q => ({
                  id: q.id,
                  prompt: q.questionId, // Seed script sets questionId to the actual question text
                  options: q.choices.map(c => ({
                    id: c.id,
                    text: c.textId,
                    isCorrect: c.isCorrect
                  }))
                }))} 
              />
            </div>
          ) : null}
        </main>

        <footer className="flex justify-between items-center border-t pt-8">
           <div className="text-sm text-muted-foreground italic">
              {isCompleted ? "✓ Anda telah menyelesaikan materi ini" : "Belum selesai"}
           </div>
           <MarkCompleteButton 
             lessonId={currentLesson.id} 
             courseSlug={courseSlug} 
             isCompleted={isCompleted} 
           />
        </footer>
      </article>
    </section>
  );
}
