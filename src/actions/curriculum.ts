"use server";

import { db } from "@/lib/db";
import { modules, lessons } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getFormMultiLang, toDbJson, type MultiLangField } from "@/lib/i18n/db-helper";

async function checkOwnership(courseId: string) {
  const session = await getSession();

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, courseId),
  });

  if (!session || !course || (session.user.id !== course.authorId && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function createModule(courseId: string, titleId: MultiLangField, titleEn?: string) {
  await checkOwnership(courseId);

  const lastModule = await db.query.modules.findFirst({
    where: (m, { eq }) => eq(m.courseId, courseId),
    orderBy: (m, { desc }) => [desc(m.order)],
  });

  const order = lastModule ? lastModule.order + 1 : 1;
  const title = typeof titleId === "object" && titleId !== null 
    ? toDbJson(titleId, "Modul") 
    : { id: String(titleId || "Modul"), en: String(titleEn || titleId || "Module") };

  try {
    await db.insert(modules).values({
      id: nanoid(),
      courseId,
      title,
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

export async function updateModule(courseId: string, moduleId: string, titleId: MultiLangField, titleEn?: string) {
  await checkOwnership(courseId);

  const title = typeof titleId === "object" && titleId !== null 
    ? toDbJson(titleId, "Modul") 
    : { id: String(titleId || "Modul"), en: String(titleEn || titleId || "Module") };

  try {
    await db.update(modules)
      .set({ title })
      .where(eq(modules.id, moduleId));
    
    revalidatePath("/studio/courses/[id]/edit/curriculum", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

export async function createLesson(
  courseId: string, 
  moduleId: string, 
  data: { titleId?: string; titleEn?: string; title?: MultiLangField; type: "video" | "article" | "quiz" }
) {
  await checkOwnership(courseId);

  const lastLesson = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.moduleId, moduleId),
    orderBy: (l, { desc }) => [desc(l.order)],
  });

  const order = lastLesson ? lastLesson.order + 1 : 1;
  const title = data.title 
    ? toDbJson(data.title, "Materi")
    : { id: data.titleId || "Materi", en: data.titleEn || data.titleId || "Lesson" };

  try {
    const [newLesson] = await db.insert(lessons).values({
      id: nanoid(),
      moduleId,
      title,
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

  const lesson = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.id, lessonId),
  });

  const title = getFormMultiLang(formData, "title", lesson?.title ? (lesson.title as any)["id"] || "Materi" : "Materi");
  const duration = parseInt(formData.get("duration") as string) || 0;
  const isFree = formData.get("isFree") === "on";
  const videoUrl = formData.get("videoUrl") as string | null;
  const content = getFormMultiLang(formData, "content", lesson?.content ? (lesson.content as any)["id"] || "" : "");

  try {
    await db.update(lessons).set({
      title,
      duration,
      isFree,
      videoUrl,
      content,
    }).where(eq(lessons.id, lessonId));

    revalidatePath("/studio/courses/[id]/edit/lessons/[lessonId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Update lesson error:", error);
    return { success: false, error: "Database error" };
  }
}
