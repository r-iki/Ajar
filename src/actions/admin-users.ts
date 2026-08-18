"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type Role = "student" | "instructor" | "admin";

export async function setUserRole(userId: string, role: Role) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  if (session.user.id === userId) {
    throw new Error("Cannot change your own role");
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { success: true };
}

export async function getAllUsers(options?: { search?: string; role?: string }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return await db.query.users.findMany({
    where: (u, { and, eq, ilike, sql }) => {
      const filters = [];
      if (options?.role) filters.push(eq(u.role, options.role as Role));
      if (options?.search) {
        filters.push(ilike(sql`CONCAT(${u.name}, ' ', ${u.email})`, `%${options.search}%`));
      }
      return filters.length > 0 ? and(...filters) : undefined;
    },
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
}
