import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { tDb } from "@/lib/i18n/db-helper";
import { getCourseStudentsDetailed } from "@/actions/student-management";
import { CourseStudentsClient } from "@/components/studio/CourseStudentsClient";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });

  if (!course) return notFound();

  const students = await getCourseStudentsDetailed(id);

  return (
    <CourseStudentsClient
      courseId={course.id}
      courseTitle={tDb(course.title, locale)}
      enrollmentType={course.enrollmentType || "public"}
      initialStudents={students as any}
    />
  );
}
