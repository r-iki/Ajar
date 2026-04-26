import { db } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { EditCourseForm } from "./EditCourseForm";
import { Image as ImageIcon } from "lucide-react";

type EditCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const locale = await getLocale();

  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!course) {
    redirect(`/${locale}/studio/courses`);
  }

  const categories = await db.query.categories.findMany();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
      <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
        <h2 className="mb-8 text-xl font-black uppercase tracking-tight">Informasi Dasar</h2>
        <EditCourseForm course={course} categories={categories} locale={locale} />
      </section>

      <aside className="space-y-8">
        <section className="rounded-2xl border bg-card/50 p-6 shadow-sm">
           <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ImageIcon className="size-4" /> Thumbnail
           </h3>
           <div className="aspect-video w-full rounded-2xl border-4 border-dashed border-muted flex items-center justify-center bg-muted/30 overflow-hidden relative group">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="Thumbnail" className="h-full w-full object-cover" />
              ) : (
                <p className="text-xs font-bold text-muted-foreground/50">Belum ada thumbnail</p>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button className="rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase text-slate-900">Ubah Gambar</button>
              </div>
           </div>
           <p className="mt-4 text-[10px] font-medium text-muted-foreground leading-relaxed">
             * Disarankan ukuran 1280x720px. Maksimal 2MB. Format JPG, PNG, atau WebP.
           </p>
        </section>
      </aside>
    </div>
  );
}

