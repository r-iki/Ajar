"use client";

import { Search, Filter, X, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLocale, useTranslations } from "next-intl";
import { tDb } from "@/lib/i18n/db-helper";
import { CustomSelect } from "@/components/ui/CustomSelect";

export function CourseFilter({ categories }: { categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("courses");
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
      router.push(`${pathname}?${params.toString()}` as any);
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
      router.push(`${pathname}?${params.toString()}` as any);
    });
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname as any);
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
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-2xl border border-border bg-card/60 py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all shadow-xs"
          />
          {isPending && (
             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
             </div>
          )}
        </div>

        {/* Level Filter */}
        <div className="min-w-[180px]">
          <CustomSelect
            name="level"
            value={currentLevel}
            onChange={(val: string) => updateFilter("level", val)}
            options={[
              { value: "", label: t("levelAll") },
              { value: "beginner", label: t("levelBeginner") },
              { value: "intermediate", label: t("levelIntermediate") },
              { value: "advanced", label: t("levelAdvanced") },
            ]}
            placeholder={t("levelAll")}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateFilter("categoryId", "")}
          className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-2xs ${
            !currentCategory ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("categoryAll")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateFilter("categoryId", cat.id)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-2xs ${
              currentCategory === cat.id ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tDb(cat.name, locale)}
          </button>
        ))}
        {(currentCategory || currentLevel || search) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-all ml-auto"
          >
            <X className="size-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
