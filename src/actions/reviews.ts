"use server";

import { db } from "@/lib/db";
import { reviews, enrollments } from "@/lib/db/schema";
import { eq, and, desc, avg, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitReview(courseId: string, rating: number, comment: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Check if enrolled
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.courseId, courseId)
    ),
  });

  if (!enrollment) {
    throw new Error("You must be enrolled to review this course");
  }

  // 2. Check if already reviewed
  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.userId, session.user.id),
      eq(reviews.courseId, courseId)
    ),
  });

  if (existingReview) {
    // Update existing review
    await db.update(reviews)
      .set({ rating, comment, createdAt: new Date() })
      .where(eq(reviews.id, existingReview.id));
  } else {
    // Create new review
    await db.insert(reviews).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      courseId,
      rating,
      comment,
      createdAt: new Date(),
    });
  }

  revalidatePath(`/courses/${courseId}`, "page");
  revalidatePath(`/learn/${courseId}`, "layout");

  return { success: true };
}

export async function getCourseReviews(courseId: string) {
  return await db.query.reviews.findMany({
    where: eq(reviews.courseId, courseId),
    with: {
      user: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
  });
}

export async function getCourseRatingSummary(courseId: string) {
  const result = await db
    .select({
      averageRating: avg(reviews.rating),
      count: sql<number>`count(${reviews.id})`,
    })
    .from(reviews)
    .where(eq(reviews.courseId, courseId));

  return {
    average: Number(result[0]?.averageRating || 0).toFixed(1),
    count: result[0]?.count || 0,
  };
}
