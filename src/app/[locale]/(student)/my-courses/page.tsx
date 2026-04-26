import { useTranslations } from "next-intl";

export default function MyCoursesPage() {
  const t = useTranslations("student");

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("myCourses")}</h1>
      <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        Daftar kursus yang sudah di-enroll akan tampil di sini.
      </div>
    </section>
  );
}
