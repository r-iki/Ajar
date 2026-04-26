"use server";

import { db } from "@/lib/db";
import { users, xpTransactions } from "@/lib/db/schema";
import { desc, sql, gte, and, eq } from "drizzle-orm";

export async function getGlobalLeaderboard(limit = 10) {
  return await db.query.users.findMany({
    orderBy: [desc(users.xp)],
    limit: limit,
    columns: {
      id: true,
      name: true,
      image: true,
      xp: true,
    },
  });
}

export async function getWeeklyLeaderboard(limit = 10) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Use a raw query or join to get sum of XP in the last 7 days
  const results = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      weeklyXp: sql<number>`sum(${xpTransactions.amount})`,
    })
    .from(users)
    .innerJoin(xpTransactions, eq(users.id, xpTransactions.userId))
    .where(gte(xpTransactions.createdAt, oneWeekAgo))
    .groupBy(users.id)
    .orderBy(desc(sql`sum(${xpTransactions.amount})`))
    .limit(limit);

  return results;
}
