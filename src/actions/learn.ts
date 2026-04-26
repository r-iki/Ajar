"use server";

import { db } from "@/lib/db";
import { lessons, modules, courses, quizzes, quizQuestions, lessonProgress } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getLearnData(courseSlug: string, lessonId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Fetch Course with Modules and Lessons
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      modules: {
        orderBy: [asc(modules.order)],
        with: {
          lessons: {
            orderBy: [asc(lessons.order)],
          },
        },
      },
    },
  });

  if (!course) return null;

  // Find Current Lesson
  let currentLesson = null;
  for (const mod of course.modules) {
    const found = mod.lessons.find((l) => l.id === lessonId);
    if (found) {
      currentLesson = found;
      break;
    }
  }

  // If lesson not found, default to first lesson
  if (!currentLesson) {
    currentLesson = course.modules[0]?.lessons[0] ?? null;
  }

  if (!currentLesson) return null;

  // If current lesson is a quiz, fetch quiz data
  let quizData = null;
  if (currentLesson.type === "quiz") {
    quizData = await db.query.quizzes.findFirst({
      where: eq(quizzes.lessonId, currentLesson.id),
      with: {
        questions: {
          orderBy: [asc(quizQuestions.order)],
          with: {
            choices: true,
          },
        },
      },
    });
  }

  // All lesson IDs belonging to this course (used to filter progress)
  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

  // Simple query — no joins, no relations needed
  const completedRows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, session.user.id));

  // Filter to only include lessons that belong to this course
  const completedLessonIds = new Set(
    completedRows.map((r) => r.lessonId).filter((id) => allLessonIds.includes(id))
  );

  const isCompleted = completedLessonIds.has(currentLesson.id);

  const cert = await db.query.certificates.findFirst({
    where: (certs, { and, eq }) => and(eq(certs.courseId, course.id), eq(certs.userId, session.user.id)),
  });

  return {
    course,
    currentLesson,
    quizData,
    isCompleted,
    completedLessonIds,
    certificateCode: cert?.code ?? null,
  };
}
