"use server";

import { db } from "@/lib/db";
import { courses, enrollments, lessons, lessonProgress, modules, users } from "@/lib/db/schema";
import { eq, sql, count, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCourseStudentsDetailed(courseId: string) {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  // Verify instructor ownership or admin
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) throw new Error("Course not found");
  if (course.authorId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Get total lessons count for this course
  const totalLessonsCount = await db.select({ count: count() })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.courseId, courseId));

  const totalLessons = totalLessonsCount[0]?.count || 0;

  // Fetch students with their progress and enrollment status
  const studentRows = await db.select({
    enrollmentId: enrollments.id,
    userId: users.id,
    name: users.name,
    email: users.email,
    image: users.image,
    enrolledAt: enrollments.enrolledAt,
    completedAt: enrollments.completedAt,
    paymentStatus: enrollments.paymentStatus,
    completedLessons: sql<number>`count(${lessonProgress.id})`,
  })
  .from(enrollments)
  .innerJoin(users, eq(enrollments.userId, users.id))
  .leftJoin(modules, eq(modules.courseId, courseId))
  .leftJoin(lessons, eq(lessons.moduleId, modules.id))
  .leftJoin(lessonProgress, and(
    eq(lessonProgress.userId, users.id),
    eq(lessonProgress.lessonId, lessons.id)
  ))
  .where(eq(enrollments.courseId, courseId))
  .groupBy(enrollments.id, users.id, enrollments.enrolledAt, enrollments.completedAt, enrollments.paymentStatus)
  .orderBy(desc(enrollments.enrolledAt));

  return studentRows.map(s => ({
    ...s,
    progress: totalLessons > 0 ? Math.round((Number(s.completedLessons) / totalLessons) * 100) : 0,
  }));
}

export async function approveStudentEnrollment(enrollmentId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: {
      course: true,
    },
  });

  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.course.authorId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.update(enrollments)
    .set({ paymentStatus: "paid" })
    .where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/studio/courses/${enrollment.courseId}/students`);
  return { success: true };
}

export async function rejectStudentEnrollment(enrollmentId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: {
      course: true,
    },
  });

  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.course.authorId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.delete(enrollments).where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/studio/courses/${enrollment.courseId}/students`);
  return { success: true };
}

export async function removeStudentFromCourse(enrollmentId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: {
      course: true,
    },
  });

  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.course.authorId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.delete(enrollments).where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/studio/courses/${enrollment.courseId}/students`);
  return { success: true };
}

export async function manualEnrollStudent(courseId: string, email: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) throw new Error("Course not found");
  if (course.authorId !== session.user.id && session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.email, email.trim().toLowerCase()),
  });

  if (!targetUser) {
    throw new Error("Pengguna dengan email tersebut belum terdaftar di platform Ajar");
  }

  await db.insert(enrollments).values({
    id: crypto.randomUUID(),
    userId: targetUser.id,
    courseId: courseId,
    paymentStatus: "paid",
  }).onConflictDoUpdate({
    target: [enrollments.userId, enrollments.courseId],
    set: { paymentStatus: "paid" },
  });

  revalidatePath(`/studio/courses/${courseId}/students`);
  return { success: true, userName: targetUser.name };
}
