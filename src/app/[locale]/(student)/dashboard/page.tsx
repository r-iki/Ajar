import { useTranslations } from "next-intl";

import { ProgressBar } from "@/components/course/ProgressBar";

export default function StudentDashboardPage() {
  const t = useTranslations("student");

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Kursus aktif</p>
          <p className="text-2xl font-semibold">3</p>
          <div className="mt-3">
            <ProgressBar value={40} />
          </div>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Lesson selesai</p>
          <p className="text-2xl font-semibold">12</p>
          <div className="mt-3">
            <ProgressBar value={60} />
          </div>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">XP</p>
          <p className="text-2xl font-semibold">240</p>
          <div className="mt-3">
            <ProgressBar value={75} />
          </div>
        </article>
      </div>
    </section>
  );
}
