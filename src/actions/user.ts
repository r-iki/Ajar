"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const locale = formData.get("locale") as string;
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const biography = formData.get("biography") as string;
  const location = formData.get("location") as string;
  const position = formData.get("position") as string;
  const availabilityStatus = formData.get("availabilityStatus") as string;
  const socialGithub = formData.get("socialGithub") as string;
  const socialLinkedin = formData.get("socialLinkedin") as string;
  const socialTwitter = formData.get("socialTwitter") as string;
  const socialFacebook = formData.get("socialFacebook") as string;
  const languages = formData.get("languages") as string;
  const skills = formData.get("skills") as string;

  try {
    await db.update(users).set({
      name,
      image,
      locale,
      username,
      bio,
      biography,
      location,
      position,
      availabilityStatus,
      socialGithub,
      socialLinkedin,
      socialTwitter,
      socialFacebook,
      languages,
      skills,
    }).where(eq(users.id, session.user.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    if (username) {
      revalidatePath(`/profile/${username}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Gagal memperbarui profil." };
  }
}

export async function getUserByUsername(username: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    with: {
      enrollments: {
        with: {
          course: true,
        },
      },
      lessonProgress: true,
      xpTransactions: true,
    },
  });

  if (!user) return null;

  const userCertificates = await db.query.certificates.findMany({
    where: (certificates, { eq }) => eq(certificates.userId, user.id),
    with: {
      course: true,
    },
  });

  return {
    ...user,
    certificates: userCertificates,
  };
}

