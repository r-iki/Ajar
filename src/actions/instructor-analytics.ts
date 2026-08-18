"use server";

import { db } from "@/lib/db";
import { courses, enrollments, lessons, lessonProgress, modules, users } from "@/lib/db/schema";
import { eq, sql, count, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function getInstructorStats() {
  const session = await getSession();

  if (!session?.user || (session.user.role !== "instructor" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // 1. Total Courses
  const instructorCourses = await db.select({ count: count() })
    .from(courses)
    .where(eq(courses.authorId, userId));

  // 2. Total Enrolled Students (Unique students across all instructor's courses)
  const totalStudents = await db.select({ count: sql<number>`count(distinct ${enrollments.userId})` })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(courses.authorId, userId));

  // 3. Total Enrollments (Total sales/joins)
  const totalEnrollments = await db.select({ count: count() })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(courses.authorId, userId));

  // 4. (Optional) Total Revenue - Assuming for now all courses have a price field
  // If price doesn't exist yet, we'll skip or use 0
  const totalRevenue = 0; 

  return {
    totalCourses: instructorCourses[0].count,
    totalStudents: totalStudents[0].count,
    totalEnrollments: totalEnrollments[0].count,
    totalRevenue
  };
}

export async function getCoursePerformance() {
  const session = await getSession();

  if (!session?.user || (session.user.role !== "instructor" && session.user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Fetch all courses for this instructor with enrollment counts
  const data = await db.select({
    id: courses.id,
    title: courses.title,
    slug: courses.slug,
    enrollmentCount: count(enrollments.id),
  })
  .from(courses)
  .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
  .where(eq(courses.authorId, userId))
  .groupBy(courses.id)
  .orderBy(desc(count(enrollments.id)));

  return data;
}

export async function getCourseStudents(courseId: string) {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  // Verify ownership
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.authorId, session.user.id)),
  });

  if (!course) throw new Error("Course not found or unauthorized");

  // Get total lessons count for this course
  const totalLessonsCount = await db.select({ count: count() })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.courseId, courseId));

  const totalLessons = totalLessonsCount[0].count || 0;

  // Fetch students with their progress
  const students = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    image: users.image,
    enrolledAt: enrollments.enrolledAt,
    completedAt: enrollments.completedAt,
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
  .groupBy(users.id, enrollments.enrolledAt, enrollments.completedAt)
  .orderBy(desc(enrollments.enrolledAt));

  return students.map(s => ({
    ...s,
    progress: totalLessons > 0 ? Math.round((s.completedLessons / totalLessons) * 100) : 0
  }));
}
