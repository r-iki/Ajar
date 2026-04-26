import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!course) {
    return notFound();
  }

  return (
    <div className="max-w-4xl space-y-12">
      <SettingsForm course={course} locale={locale} />
    </div>
  );
}
