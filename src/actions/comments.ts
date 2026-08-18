"use server";

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addComment(lessonId: string, content: string, parentId?: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const newComment = await db.insert(comments).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    lessonId,
    content,
    parentId,
    createdAt: new Date(),
  }).returning();

  revalidatePath(`/learn/[slug]/[lessonId]`, "page");

  return { success: true, comment: newComment[0] };
}

export async function getCommentsByLesson(lessonId: string) {
  return await db.query.comments.findMany({
    where: eq(comments.lessonId, lessonId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: [desc(comments.createdAt)],
  });
}

export async function deleteComment(commentId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.delete(comments).where(
    and(
      eq(comments.id, commentId),
      eq(comments.userId, session.user.id)
    )
  );

  revalidatePath(`/learn/[slug]/[lessonId]`, "page");
  return { success: true };
}
