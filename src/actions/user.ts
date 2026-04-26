"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const locale = formData.get("locale") as string;

  try {
    await db.update(users).set({
      name,
      image,
      locale,
    }).where(eq(users.id, session.user.id));

    revalidatePath("/account/settings");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Gagal memperbarui profil." };
  }
}
