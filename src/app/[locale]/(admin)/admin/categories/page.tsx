import { getCategories } from "@/actions/course";
import { CategoryList } from "@/components/studio/CategoryList";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Manajemen Kategori</h1>
        <p className="text-muted-foreground">Tambah dan kelola kategori kursus untuk platform Anda.</p>
      </header>

      <CategoryList categories={categories} />
    </div>
  );
}
