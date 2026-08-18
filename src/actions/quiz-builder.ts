"use server";

import { db } from "@/lib/db";
import { quizzes, quizQuestions, quizChoices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

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

export async function ensureQuizExists(lessonId: string) {
  const existing = await db.query.quizzes.findFirst({
    where: eq(quizzes.lessonId, lessonId),
  });
  if (existing) return existing;

  const [newQuiz] = await db.insert(quizzes).values({
    id: nanoid(),
    lessonId,
  }).returning();
  return newQuiz;
}

export async function addQuestion(courseId: string, quizId: string) {
  await checkOwnership(courseId);

  const lastQuestion = await db.query.quizQuestions.findFirst({
    where: eq(quizQuestions.quizId, quizId),
    orderBy: (q, { desc }) => [desc(q.order)],
  });

  const order = lastQuestion ? lastQuestion.order + 1 : 1;

  const [newQuestion] = await db.insert(quizQuestions).values({
    id: nanoid(),
    quizId,
    question: {
      en: "New Question",
      id: "Pertanyaan Baru",
    },
    order,
  }).returning();

  return { success: true, questionId: newQuestion.id };
}

export async function updateQuestion(courseId: string, questionId: string, data: any) {
  await checkOwnership(courseId);
  const cleanData = { ...data };
  if (cleanData.questionEn || cleanData.questionId) {
    cleanData.question = {
      id: cleanData.questionId || cleanData.question?.id || "",
      en: cleanData.questionEn || cleanData.question?.en || "",
    };
    delete cleanData.questionEn;
    delete cleanData.questionId;
  }
  await db.update(quizQuestions).set(cleanData).where(eq(quizQuestions.id, questionId));
  return { success: true };
}

export async function deleteQuestion(courseId: string, questionId: string) {
  await checkOwnership(courseId);
  await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));
  return { success: true };
}

export async function addChoice(courseId: string, questionId: string) {
  await checkOwnership(courseId);
  const [newChoice] = await db.insert(quizChoices).values({
    id: nanoid(),
    questionId,
    text: {
      en: "New Choice",
      id: "Pilihan Baru",
    },
    isCorrect: false,
  }).returning();
  return { success: true, choiceId: newChoice.id };
}

export async function updateChoice(courseId: string, choiceId: string, data: any) {
  await checkOwnership(courseId);
  
  if (data.isCorrect) {
    // Unset other correct choices for this question
    const choice = await db.query.quizChoices.findFirst({
        where: eq(quizChoices.id, choiceId)
    });
    if (choice) {
        await db.update(quizChoices).set({ isCorrect: false }).where(eq(quizChoices.questionId, choice.questionId));
    }
  }

  const cleanData = { ...data };
  if (cleanData.textEn || cleanData.textId) {
    cleanData.text = {
      id: cleanData.textId || cleanData.text?.id || "",
      en: cleanData.textEn || cleanData.text?.en || "",
    };
    delete cleanData.textEn;
    delete cleanData.textId;
  }

  await db.update(quizChoices).set(cleanData).where(eq(quizChoices.id, choiceId));
  return { success: true };
}

export async function deleteChoice(courseId: string, choiceId: string) {
  await checkOwnership(courseId);
  await db.delete(quizChoices).where(eq(quizChoices.id, choiceId));
  return { success: true };
}
