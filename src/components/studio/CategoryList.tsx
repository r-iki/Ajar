"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory } from "@/actions/course";
import { Plus, Loader2, Tag, Globe, Languages, Pencil, Trash2, X } from "lucide-react";
import { MultiLangInput } from "@/components/studio/MultiLangInput";
import { getLangVal, tDb } from "@/lib/i18n/db-helper";

export function CategoryList({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = editingCategory 
        ? await updateCategory(editingCategory.id, formData)
        : await createCategory(formData);

      if (result.success) {
        toast.success(editingCategory ? "Kategori diperbarui!" : "Kategori berhasil ditambahkan!");
        setShowAddForm(false);
        setEditingCategory(null);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal memproses kategori.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      // Reset after 3 seconds if not clicked again
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Kategori dihapus.");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus.");
      }
    } catch (error) {
      toast.error("Error sistem.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setEditingCategory(null);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-3 text-sm font-black text-white dark:text-slate-900 transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="size-4" />
          Tambah Kategori Baru
        </button>
      </div>

      {(showAddForm || editingCategory) && (
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <button type="button" onClick={() => { setShowAddForm(false); setEditingCategory(null); }} className="rounded-full p-1 hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>

          <MultiLangInput 
            label="Nama Kategori"
            namePrefix="name"
            defaultValue={editingCategory?.name}
            required
            placeholder="Misal: Web Development"
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Icon (Lucide Name / Emoji)</label>
            <input 
              name="icon"
              defaultValue={editingCategory?.icon || ""}
              placeholder="Code, Monitor, Layout, etc."
              className="w-full rounded-xl border bg-background/50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : (editingCategory ? "Simpan Perubahan" : "Simpan Kategori")}
            </button>
            <button 
              type="button"
              onClick={() => { setShowAddForm(false); setEditingCategory(null); }}
              className="px-6 rounded-xl border py-3 text-sm font-black transition-all hover:bg-muted"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/30">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Tag className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{tDb(cat.name, "id")}</h3>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{tDb(cat.name, "en") !== tDb(cat.name, "id") ? tDb(cat.name, "en") : "Global"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingCategory(cat);
                  setShowAddForm(false);
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                disabled={deletingId === cat.id}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase transition-all ${
                  confirmDeleteId === cat.id 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                } disabled:opacity-50`}
              >
                {deletingId === cat.id ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : confirmDeleteId === cat.id ? (
                  "Yakin?"
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
