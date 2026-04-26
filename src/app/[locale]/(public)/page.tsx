import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function LandingPage() {
  const t = useTranslations("home");

  return (
    <section className="grid gap-8 py-12 md:grid-cols-[1.2fr_1fr] md:items-center">
      <div className="space-y-5">
        <p className="inline-flex rounded-full border bg-card px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
          LMS Foundation - Phase 1
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("headline")}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t("description")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses" className="rounded-lg bg-black px-4 py-2.5 text-white hover:opacity-90">
            {t("ctaExplore")}
          </Link>
          <Link href="/sign-up" className="rounded-lg border px-4 py-2.5 hover:bg-muted">
            {t("ctaStart")}
          </Link>
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Phase 1 Checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>- Bilingual routing (ID/EN)</li>
          <li>- Course catalog and detail pages</li>
          <li>- Student dashboard skeleton</li>
          <li>- Drizzle + Neon + Better Auth setup</li>
        </ul>
      </div>
    </section>
  );
}
