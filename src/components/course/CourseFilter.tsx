"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

export function CourseFilter({ categories }: { categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const currentCategory = searchParams.get("categoryId") || "";
  const currentLevel = searchParams.get("level") || "";

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 300);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Cari kursus idamanmu..."
            className="w-full rounded-2xl border bg-card/50 py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-sm"
          />
          {isPending && (
             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
             </div>
          )}
        </div>

        {/* Level Filter */}
        <select
          value={currentLevel}
          onChange={(e) => updateFilter("level", e.target.value)}
          className="rounded-2xl border bg-card/50 py-3.5 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer shadow-sm min-w-[150px]"
        >
          <option value="">Semua Level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateFilter("categoryId", "")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
            !currentCategory ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border"
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateFilter("categoryId", cat.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
              currentCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted border"
            }`}
          >
            {cat.nameId || cat.name}
          </button>
        ))}
        {(currentCategory || currentLevel || search) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition-all"
          >
            <X className="size-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
