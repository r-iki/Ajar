type EditCoursePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Edit Course {id}</h1>
      <p className="text-muted-foreground">Editor Tiptap dan quiz builder disiapkan pada Phase 3.</p>
    </section>
  );
}
