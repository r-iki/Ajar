"use server";

import { db } from "@/lib/db";
import { users, xpTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function awardXP(userId: string, amount: number, reason: string) {
  try {
    // 1. Log the transaction
    await db.insert(xpTransactions).values({
      id: crypto.randomUUID(),
      userId,
      amount,
      reason,
      createdAt: new Date(),
    });

    // 2. Update user's total XP
    await db
      .update(users)
      .set({
        xp: sql`${users.xp} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Failed to award XP:", error);
    return { success: false, error: "Failed to award XP" };
  }
}
