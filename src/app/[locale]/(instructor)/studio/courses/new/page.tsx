import { db } from "@/lib/db";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, Settings2, Info } from "lucide-react";
import { CreateCourseForm } from "./CreateCourseForm";

export default async function NewCoursePage() {
  const locale = await getLocale();
  const t = await getTranslations("studio");
  const categories = await db.query.categories.findMany();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-primary">
           <div className="rounded-2xl bg-primary/10 p-2">
              <BookOpen className="size-6" />
           </div>
           <span className="text-xs font-black uppercase tracking-widest">{t("newCourse")}</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("newCourse")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-10 md:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8">
               <Info className="size-5 text-primary" />
               <h2 className="text-xl font-black uppercase tracking-tight">{t("courseTitle")} & {t("courseDesc")}</h2>
            </div>
            <CreateCourseForm categories={categories} locale={locale} />
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-primary/5 p-6 space-y-4">
             <div className="flex items-center gap-2 text-primary">
                <Settings2 className="size-4" />
                <span className="text-xs font-black uppercase tracking-widest">Tips</span>
             </div>
             <div className="space-y-4 text-xs font-medium text-muted-foreground leading-relaxed">
                <p>• {t("courseTitle")}: {t("subtitle")}</p>
                <p>• {t("priceFreeHint")}</p>
                <p>• {t("curriculum")}: {t("addModule")}, {t("addLesson")}.</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
