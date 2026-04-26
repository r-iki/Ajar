"use server";

import { db } from "@/lib/db";
import { courses, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCourses() {
  return await db.select().from(courses);
}

export async function getCourseBySlug(slug: string) {
  const result = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      modules: {
        orderBy: (modules, { asc }) => [asc(modules.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
      author: true,
      category: true,
    },
  });
  
  return result || null;
}

export async function getCategories() {
  return await db.select().from(categories);
}
