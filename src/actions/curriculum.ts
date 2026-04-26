"use server";

import { db } from "@/lib/db";
import { modules, lessons } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

async function checkOwnership(courseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, courseId),
  });

  if (!session || !course || (session.user.id !== course.authorId && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function createModule(courseId: string, titleId: string, titleEn: string) {
  await checkOwnership(courseId);

  const lastModule = await db.query.modules.findFirst({
    where: (m, { eq }) => eq(m.courseId, courseId),
    orderBy: (m, { desc }) => [desc(m.order)],
  });

  const order = lastModule ? lastModule.order + 1 : 1;

  try {
    await db.insert(modules).values({
      id: nanoid(),
      courseId,
      titleId,
      titleEn,
      order,
    });
    revalidatePath("/studio/courses/[id]/edit/curriculum", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

export async function deleteModule(courseId: string, moduleId: string) {
  await checkOwnership(courseId);

  try {
    await db.delete(modules).where(eq(modules.id, moduleId));
    revalidatePath("/studio/courses/[id]/edit/curriculum", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

export async function updateModule(courseId: string, moduleId: string, titleId: string, titleEn: string) {
  await checkOwnership(courseId);

  try {
    await db.update(modules)
      .set({ titleId, titleEn })
      .where(eq(modules.id, moduleId));
    
    revalidatePath("/studio/courses/[id]/edit/curriculum", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

export async function createLesson(courseId: string, moduleId: string, data: { titleId: string, titleEn: string, type: "video" | "article" | "quiz" }) {
  await checkOwnership(courseId);

  const lastLesson = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.moduleId, moduleId),
    orderBy: (l, { desc }) => [desc(l.order)],
  });

  const order = lastLesson ? lastLesson.order + 1 : 1;

  try {
    const [newLesson] = await db.insert(lessons).values({
      id: nanoid(),
      moduleId,
      titleId: data.titleId,
      titleEn: data.titleEn,
      type: data.type,
      order,
      duration: 0,
    }).returning();
    revalidatePath("/studio/courses/[id]/edit/curriculum", "page");
    return { success: true, lessonId: newLesson.id };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await checkOwnership(courseId);

  try {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    revalidatePath("/studio/courses/[id]/edit/curriculum", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}
export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
  await checkOwnership(courseId);

  const titleId = formData.get("titleId") as string;
  const titleEn = formData.get("titleEn") as string;
  const duration = parseInt(formData.get("duration") as string) || 0;
  const isFree = formData.get("isFree") === "on";
  const videoUrl = formData.get("videoUrl") as string | null;
  const contentId = formData.get("contentId") as string | null;
  const contentEn = formData.get("contentEn") as string | null;

  try {
    await db.update(lessons).set({
      titleId,
      titleEn,
      duration,
      isFree,
      videoUrl,
      contentId,
      contentEn,
    }).where(eq(lessons.id, lessonId));

    revalidatePath("/studio/courses/[id]/edit/lessons/[lessonId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Update lesson error:", error);
    return { success: false, error: "Database error" };
  }
}
