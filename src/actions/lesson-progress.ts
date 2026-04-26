"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessonProgress, lessons, modules } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Mark current as complete
  await db
    .insert(lessonProgress)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      lessonId: lessonId,
      completedAt: new Date(),
    })
    .onConflictDoNothing();

  // Find next lesson
  const currentLesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      module: {
        with: {
          course: {
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
          },
        },
      },
    },
  });

  if (!currentLesson) throw new Error("Lesson not found");

  const allLessons = currentLesson.module.course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentIndex + 1];

  revalidatePath(`/learn/${currentLesson.module.course.slug}`);

  return {
    success: true,
    nextLessonId: nextLesson?.id || null,
  };
}
