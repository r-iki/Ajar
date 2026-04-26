"use server";

import { db } from "@/lib/db";
import { courses, enrollments, lessons, lessonProgress } from "@/lib/db/schema";
import { eq, sql, count, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getInstructorStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

import { desc } from "drizzle-orm";
