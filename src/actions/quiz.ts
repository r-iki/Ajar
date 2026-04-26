"use server";

import { db } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { markLessonComplete } from "./lesson-progress";

type SubmitQuizInput = {
  userId: string;
  quizId: string;
  lessonId: string;
  correctAnswers: string[]; // List of correct choice IDs
  selectedAnswers: string[]; // List of selected choice IDs
};

export async function submitQuizAttempt(input: SubmitQuizInput) {
  const maxScore = input.correctAnswers.length;
  const score = input.selectedAnswers.reduce((total, answer, index) => {
    return total + Number(answer === input.correctAnswers[index]);
  }, 0);

  const percentage = Math.round((score / Math.max(1, maxScore)) * 100);

  // Save attempt to database
  await db.insert(quizAttempts).values({
    id: crypto.randomUUID(),
    userId: input.userId,
    quizId: input.quizId,
    answers: JSON.stringify(input.selectedAnswers),
    score: score,
    submittedAt: new Date(),
  });

  // If score >= 80%, mark lesson as complete
  let nextLessonId = null;
  if (percentage >= 80) {
    const result = await markLessonComplete(input.lessonId);
    nextLessonId = result.nextLessonId;
  }

  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= 80,
    nextLessonId,
  };
}
