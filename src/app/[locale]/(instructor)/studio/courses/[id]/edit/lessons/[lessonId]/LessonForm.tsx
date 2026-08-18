"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2, Save, Video, Clock, FileText, Globe, Languages, HelpCircle, Plus, X, Copy, Check } from "lucide-react";
import { updateLesson } from "@/actions/curriculum";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MultiLangInput, ALL_AVAILABLE_LOCALES } from "@/components/studio/MultiLangInput";
import { getLangVal } from "@/lib/i18n/db-helper";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function LessonForm({ lesson, courseId, locale }: { lesson: any, courseId: string, locale: string }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const t = useTranslations("studio");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);

  // Parse existing content dictionary
  const [contents, setContents] = useState<Record<string, string>>(() => {
    if (lesson.content && typeof lesson.content === "object") {
      const init: Record<string, string> = {};
      Object.entries(lesson.content).forEach(([k, v]) => {
        if (typeof v === "string") init[k] = v;
      });
      return init;
    }
    if (typeof lesson.content === "string") {
      return { id: lesson.content };
    }
    return { id: "" };
  });

  const [activeLocales, setActiveLocales] = useState<string[]>(() => {
    const keys = Object.keys(contents).filter((k) => contents[k]?.trim() !== "");
    return keys.length > 0 ? keys : ["id"];
  });

  const [activeLangTab, setActiveLangTab] = useState<string>(activeLocales[0] || "id");
  const [duration, setDuration] = useState(lesson.duration || 5);
  const [copied, setCopied] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Auto-calculate duration based on active text reading time
  useEffect(() => {
    if (lesson.type === 'article') {
      const text = contents[activeLangTab] || Object.values(contents)[0] || "";
      const words = text.trim().split(/\s+/).length;
      if (words > 0 && text.trim().length > 0) {
        const calculatedMinutes = Math.max(1, Math.ceil(words / 200));
        setDuration(calculatedMinutes);
      }
    }
  }, [contents, activeLangTab, lesson.type]);

  const handleContentChange = (lang: string, val: string) => {
    setContents((prev) => ({ ...prev, [lang]: val }));
  };

  const handleAddLanguage = (langCode: string) => {
    if (!activeLocales.includes(langCode)) {
      setActiveLocales([...activeLocales, langCode]);
    }
    setActiveLangTab(langCode);
    setShowAddMenu(false);
  };

  const handleRemoveLanguage = (langCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLocales.length <= 1) {
      toast.error("Minimal harus ada 1 bahasa aktif.");
      return;
    }
    const updated = activeLocales.filter((l) => l !== langCode);
    setActiveLocales(updated);

    const nextContents = { ...contents };
    delete nextContents[langCode];
    setContents(nextContents);

    if (activeLangTab === langCode) {
      setActiveLangTab(updated[0]);
    }
  };

  const handleCopyFromActive = () => {
    const currentText = contents[activeLangTab] || "";
    if (!currentText.trim()) {
      toast.error("Konten bahasa aktif masih kosong.");
      return;
    }
    const nextContents = { ...contents };
    activeLocales.forEach((loc) => {
      if (!nextContents[loc] || !nextContents[loc].trim()) {
        nextContents[loc] = currentText;
      }
    });
    setContents(nextContents);
    setCopied(true);
    toast.success(t("contentCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const getLocaleMeta = (code: string) => {
    return (
      ALL_AVAILABLE_LOCALES.find((l) => l.code === code) || {
        code,
        label: code.toUpperCase(),
        flag: "🌐",
      }
    );
  };

  const availableToAdd = ALL_AVAILABLE_LOCALES.filter(
    (l) => !activeLocales.includes(l.code)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("content", JSON.stringify(contents));
    
    try {
      const result = await updateLesson(courseId, lesson.id, formData);
      if (result.success) {
        toast.success(t("lessonUpdated"));
        router.refresh();
      } else {
        toast.error(result.error || t("lessonUpdateFailed"));
      }
    } catch (error) {
      toast.error(t("systemError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-6 rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
           <MultiLangInput 
             label={t("lessonTitle")}
             namePrefix="title"
             defaultValue={lesson.title}
             required
           />
        </section>

        <section className="space-y-6 rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl">
           <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="size-4" /> {t("additionalSettings")}
           </h2>
           <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("durationMins")}</label>
                    {lesson.type === 'article' && (
                      <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">Auto-calc</span>
                    )}
                 </div>
                <input 
                  name="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  required
                  className="w-full rounded-2xl border bg-background/50 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                />
             </div>
             <div className="flex items-center justify-between rounded-2xl border bg-background/50 p-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("freePreview")}</label>
                <input 
                  name="isFree"
                  type="checkbox"
                  defaultChecked={lesson.isFree}
                  className="size-5 rounded-lg border-primary accent-primary cursor-pointer"
                />
             </div>
           </div>
        </section>
      </div>

      {lesson.type === 'video' && (
        <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl space-y-6">
           <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Video className="size-4" /> Video Source
           </h2>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">YouTube URL / Video ID</label>
              <input 
                name="videoUrl"
                defaultValue={lesson.videoUrl || ""}
                required
                className="w-full rounded-2xl border bg-background/50 px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-hidden transition-all"
                placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              <p className="text-[10px] text-muted-foreground font-medium px-1">
                {t("youtubeHint")}
              </p>
           </div>
        </section>
      )}

      {lesson.type === 'article' && (
        <section className="rounded-2xl border bg-card/50 p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" /> {t("articleContent")}
            </h2>

            <div className="flex items-center gap-2">
              {activeLocales.length > 1 && (
                <button
                  type="button"
                  onClick={handleCopyFromActive}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-xl border border-border/50"
                  title={t("copyToLangTooltip")}
                >
                  {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t("copied") : t("copyToLang")}</span>
                </button>
              )}

              {availableToAdd.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="text-xs font-black uppercase tracking-wider text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20"
                  >
                    <Plus className="size-3.5" />
                    <span>+ {t("addTranslation")}</span>
                  </button>

                  {showAddMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 mb-1">
                        {t("selectLanguage")}
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-hide">
                        {availableToAdd.map((loc) => (
                          <button
                            key={loc.code}
                            type="button"
                            onClick={() => handleAddLanguage(loc.code)}
                            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-xl hover:bg-primary/10 hover:text-primary flex items-center justify-between transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span>{loc.flag}</span>
                              <span>{loc.label}</span>
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                              {loc.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Language Tabs Strip */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/60">
            {activeLocales.map((code) => {
              const loc = getLocaleMeta(code);
              const isActive = activeLangTab === code;
              const hasContent = Boolean(contents[code]?.trim());

              return (
                <div
                  key={code}
                  onClick={() => setActiveLangTab(code)}
                  className={`group px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 select-none ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  }`}
                >
                  <span>{loc.flag}</span>
                  <span className="uppercase tracking-wider text-[11px]">{loc.label}</span>

                  {hasContent ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary-foreground" : "bg-emerald-500"}`} />
                  ) : (
                    <span className={`text-[9px] px-1 rounded ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {t("optional")}
                    </span>
                  )}

                  {activeLocales.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveLanguage(code, e)}
                      title={`${t("removeLang")} ${loc.label}`}
                      className={`rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-black/20 dark:hover:bg-white/20 transition-all ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Markdown Editor */}
          <div className="space-y-4">
            <div className="modern-editor-wrapper rounded-3xl border border-border/50 bg-background/30 backdrop-blur-md transition-all focus-within:border-primary/30 focus-within:shadow-2xl focus-within:shadow-primary/5">
              <MDEditor
                key={activeLangTab}
                value={contents[activeLangTab] || ""}
                onChange={(val) => handleContentChange(activeLangTab, val || "")}
                height={500}
                preview="live"
                hideToolbar={false}
                enableScroll={true}
                data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
                previewOptions={{ 
                  className: "prose max-w-none dark:prose-invert p-6",
                }}
                className="!bg-transparent !border-none !rounded-3xl"
              />
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <div className="rounded-full bg-primary/20 p-2 text-primary mt-0.5">
                <FileText className="size-3" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                {t("editingVersion")} <strong>{getLocaleMeta(activeLangTab).label}</strong> ({activeLangTab.toUpperCase()}).
                {" "}{t("fallbackHint")}
              </p>
            </div>
          </div>
        </section>
      )}

      {lesson.type === 'quiz' && (
        <section className="rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur-xl space-y-8">
           <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="rounded-full bg-amber-500/10 p-10 text-amber-500">
                 <HelpCircle className="size-20" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black">{t("quizBuilder")}</h2>
                 <p className="text-muted-foreground max-w-sm">{t("quizBuilderDesc")}</p>
              </div>
              <Link 
                href={`/${locale}/studio/courses/${courseId}/edit/lessons/${lesson.id}/quiz` as any}
                className="rounded-2xl bg-amber-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-amber-500/20 hover:opacity-90"
              >
                {t("openQuizBuilder")}
              </Link>
           </div>
        </section>
      )}

      <div className="sticky bottom-8 flex justify-center z-10">
        <button 
          type="submit"
          disabled={loading}
          className="flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-sm font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/30"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <Save className="size-5" />
              {t("saveLesson")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
