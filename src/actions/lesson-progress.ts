"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { enrollments, lessonProgress, lessons, modules } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { awardXP } from "./xp";

export async function markLessonComplete(lessonId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check if already completed to avoid duplicate XP
  const existingProgress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.lessonId, lessonId)
    ),
  });

  if (!existingProgress) {
    // Mark current as complete
    await db
      .insert(lessonProgress)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        lessonId: lessonId,
        completedAt: new Date(),
      });

    // Award XP
    await awardXP(session.user.id, 10, `Completed lesson: ${lessonId}`);
  }

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

  // Check for course completion
  const courseId = currentLesson.module.course.id;
  const totalLessons = allLessons.length;
  const completedLessons = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, session.user.id),
      sql`${lessonProgress.lessonId} IN ${allLessons.map(l => l.id)}`
    )
  });

  if (completedLessons.length === totalLessons) {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, session.user.id),
        eq(enrollments.courseId, courseId)
      )
    });

    if (enrollment && !enrollment.completedAt) {
      await db.update(enrollments)
        .set({ completedAt: new Date() })
        .where(eq(enrollments.id, enrollment.id));
      
      await awardXP(session.user.id, 100, `Completed course: ${courseId}`);
    }
  }

  revalidatePath(`/learn/${currentLesson.module.course.slug}`);

  return {
    success: true,
    nextLessonId: nextLesson?.id || null,
  };
}
