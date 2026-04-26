"use server";

import { db } from "@/lib/db";
import { courses, categories } from "@/lib/db/schema";
import { eq, ilike, and, or, desc } from "drizzle-orm";

export async function getCourses(options?: { categoryId?: string; level?: string; search?: string }) {
  return await db.query.courses.findMany({
    where: (course, { eq, and, ilike, or }) => {
      const filters = [];
      if (options?.categoryId) filters.push(eq(course.categoryId, options.categoryId));
      if (options?.level) filters.push(eq(course.level, options.level));
      if (options?.search) {
        filters.push(
          or(
            ilike(course.titleId, `%${options.search}%`),
            ilike(course.titleEn, `%${options.search}%`)
          )
        );
      }
      if (filters.length === 0) return undefined;
      return and(...filters);
    },
    with: {
      category: true,
    },
  });
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

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function createCourse(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "instructor" && session.user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  const titleId = formData.get("titleId") as string;
  const titleEn = formData.get("titleEn") as string;
  const descId = formData.get("descId") as string;
  const descEn = formData.get("descEn") as string;
  const categoryId = formData.get("categoryId") as string;
  const level = formData.get("level") as any;

  const slug = titleEn
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "") + "-" + nanoid(6);

  try {
    const [newCourse] = await db.insert(courses).values({
      id: nanoid(),
      slug,
      titleId,
      titleEn,
      descId,
      descEn,
      categoryId,
      level,
      authorId: session.user.id,
      status: "draft",
      price: "0",
      currency: "IDR",
    }).returning();

    return { success: true, courseId: newCourse.id };
  } catch (error) {
    console.error("Create course error:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateCourse(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!session || !course || (session.user.id !== course.authorId && session.user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  const titleId = formData.get("titleId") as string;
  const titleEn = formData.get("titleEn") as string;
  const descId = formData.get("descId") as string;
  const descEn = formData.get("descEn") as string;
  const categoryId = formData.get("categoryId") as string;
  const level = formData.get("level") as any;
  const status = formData.get("status") as any;
  const price = formData.get("price") as string;

  try {
    await db.update(courses).set({
      titleId,
      titleEn,
      descId,
      descEn,
      categoryId,
      level,
      status,
      price,
    }).where(eq(courses.id, id));

    return { success: true };
  } catch (error) {
    console.error("Update course error:", error);
    return { success: false, error: "Database error" };
  }
}

export async function deleteCourse(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!session || !course || (session.user.id !== course.authorId && session.user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.delete(courses).where(eq(courses.id, id));
    return { success: true };
  } catch (error) {
    console.error("Delete course error:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateCourseSettings(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!session || !course || (session.user.id !== course.authorId && session.user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  const slug = formData.get("slug") as string;
  const metaDescription = formData.get("metaDescription") as string;
  const enrollmentType = formData.get("enrollmentType") as any;

  try {
    await db.update(courses).set({
      slug,
      metaDescription,
      enrollmentType,
    }).where(eq(courses.id, id));

    return { success: true };
  } catch (error) {
    console.error("Update settings error:", error);
    return { success: false, error: "Database error" };
  }
}

export async function createCategory(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "admin" && session.user.role !== "instructor")) {
    return { success: false, error: "Unauthorized" };
  }

  const nameId = formData.get("nameId") as string;
  const nameEn = formData.get("nameEn") as string;
  const icon = formData.get("icon") as string;

  const slug = nameEn.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  try {
    await db.insert(categories).values({
      id: nanoid(),
      name: nameEn, 
      nameEn,
      nameId,
      slug,
      icon,
    });
    return { success: true };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const nameId = formData.get("nameId") as string;
  const nameEn = formData.get("nameEn") as string;
  const icon = formData.get("icon") as string;

  const slug = nameEn.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  try {
    await db.update(categories).set({
      name: nameEn,
      nameEn,
      nameId,
      slug,
      icon,
    }).where(eq(categories.id, id));
    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Database error" };
  }
}

export async function deleteCategory(id: string) {
  console.log("Deleting category:", id);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "admin" && session.user.role !== "instructor")) {
    console.log("Unauthorized delete attempt");
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Get the category to be deleted
    const [categoryToDelete] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (!categoryToDelete) {
      console.log("Category not found:", id);
      return { success: false, error: "Category not found" };
    }

    // 2. Find or Create "Lainnya" category
    let [otherCategory] = await db.select().from(categories).where(eq(categories.slug, "lainnya")).limit(1);

    if (!otherCategory && categoryToDelete.slug !== "lainnya") {
      console.log("Creating 'Lainnya' category...");
      const otherId = nanoid();
      const [newOther] = await db.insert(categories).values({
        id: otherId,
        name: "Lainnya",
        nameId: "Lainnya",
        nameEn: "Others",
        slug: "lainnya",
        icon: "MoreHorizontal",
      }).returning();
      otherCategory = newOther;
    }

    // 3. Update courses to "Lainnya" category if they were in the deleted one
    if (otherCategory && otherCategory.id !== id) {
      console.log("Reassigning courses from", id, "to", otherCategory.id);
      await db.update(courses)
        .set({ categoryId: otherCategory.id })
        .where(eq(courses.categoryId, id));
    }

    // 4. Finally delete the category
    console.log("Executing delete for:", id);
    await db.delete(categories).where(eq(categories.id, id));
    
    console.log("Delete successful");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Database error" };
  }
}
