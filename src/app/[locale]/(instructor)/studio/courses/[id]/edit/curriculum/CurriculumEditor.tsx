"use client";

import { useState } from "react";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit2, 
  Video, 
  FileText, 
  HelpCircle, 
  Loader2, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  X,
  Languages
} from "lucide-react";
import { createModule, deleteModule, updateModule, createLesson, deleteLesson } from "@/actions/curriculum";
import { toast } from "sonner";
import Link from "next/link";
import { tDb, getLangVal } from "@/lib/i18n/db-helper";
import { MultiLangInput, ALL_AVAILABLE_LOCALES } from "@/components/studio/MultiLangInput";
import { useTranslations } from "next-intl";

export function CurriculumEditor({ courseId, initialModules, locale }: { courseId: string, initialModules: any[], locale: string }) {
  const t = useTranslations("studio");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(initialModules.map(m => m.id));

  // Edit module state
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitles, setEditModuleTitles] = useState<Record<string, string>>({ id: "" });

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  // Add module state
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitles, setNewModuleTitles] = useState<Record<string, string>>({ id: "" });

  // Add lesson state
  const [addingLesson, setAddingLesson] = useState<{ moduleId: string; type: "video" | "article" | "quiz" } | null>(null);
  const [newLessonTitles, setNewLessonTitles] = useState<Record<string, string>>({ id: "" });

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryTitle = newModuleTitles.id || Object.values(newModuleTitles).find(v => v.trim() !== "");
    if (!primaryTitle || !primaryTitle.trim()) {
      toast.error("Judul modul tidak boleh kosong.");
      return;
    }

    setLoading("module-new");
    try {
      const result = await createModule(courseId, newModuleTitles);
      if (result.success) {
        toast.success("Modul berhasil ditambahkan!");
        setAddingModule(false);
        setNewModuleTitles({ id: "" });
      } else {
        toast.error(result.error || "Gagal menambahkan modul.");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmitEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModuleId) return;
    const primaryTitle = editModuleTitles.id || Object.values(editModuleTitles).find(v => v.trim() !== "");
    if (!primaryTitle || !primaryTitle.trim()) {
      toast.error("Judul modul tidak boleh kosong.");
      return;
    }

    setLoading(`edit-${editingModuleId}`);
    try {
      const result = await updateModule(courseId, editingModuleId, editModuleTitles);
      if (result.success) {
        toast.success("Modul berhasil diperbarui!");
        setEditingModuleId(null);
      } else {
        toast.error(result.error || "Gagal memperbarui modul.");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingLesson) return;
    const primaryTitle = newLessonTitles.id || Object.values(newLessonTitles).find(v => v.trim() !== "");
    if (!primaryTitle || !primaryTitle.trim()) {
      toast.error("Judul materi tidak boleh kosong.");
      return;
    }

    setLoading(`${addingLesson.moduleId}-${addingLesson.type}`);
    try {
      const result = await createLesson(courseId, addingLesson.moduleId, { 
        title: newLessonTitles,
        type: addingLesson.type 
      });
      if (result.success) {
        toast.success("Materi berhasil ditambahkan!");
        setAddingLesson(null);
        setNewLessonTitles({ id: "" });
      } else {
        toast.error(result.error || "Gagal menambahkan materi.");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm(tCommon("confirmDelete"))) return;
    
    setLoading(moduleId);
    try {
      const result = await deleteModule(courseId, moduleId);
      if (result.success) toast.success("Modul berhasil dihapus!");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(tCommon("confirmDelete"))) return;
    
    setLoading(lessonId);
    try {
      const result = await deleteLesson(courseId, lessonId);
      if (result.success) toast.success("Materi berhasil dihapus!");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        {initialModules.map((module, index) => (
          <div key={module.id} className="group overflow-hidden rounded-2xl border bg-card/50 shadow-sm transition-all hover:border-primary/30">
            {/* Module Header */}
            <div className="flex items-center justify-between bg-muted/30 p-5">
              <div className="flex flex-1 items-center gap-4">
                <GripVertical className="size-5 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />
                
                {editingModuleId === module.id ? (
                  <form onSubmit={handleSubmitEditModule} className="flex-1 space-y-3 pr-4">
                    <MultiLangInput
                      label={t("editModule")}
                      namePrefix="editTitle"
                      defaultValue={module.title}
                      placeholder="Title..."
                      onChange={(val) => setEditModuleTitles(val)}
                      required
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        type="submit" 
                        disabled={loading === `edit-${module.id}`} 
                        className="rounded-xl bg-primary px-4 py-1.5 text-xs font-black text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                      >
                        {loading === `edit-${module.id}` ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                        <span>{t("saveChanges")}</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingModuleId(null)} 
                        className="rounded-xl bg-muted px-4 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/80"
                      >
                        {tCommon("cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left"
                  >
                    {expandedModules.includes(module.id) ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-[11px] font-black text-primary-foreground shadow-sm shadow-primary/20">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-black uppercase tracking-tight text-foreground">
                        {tDb(module.title, locale)}
                      </h3>
                    </div>
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {editingModuleId !== module.id && (
                   <button 
                     onClick={() => {
                       setEditingModuleId(module.id);
                       setEditModuleTitles(typeof module.title === "object" && module.title !== null ? module.title : { id: module.title || "" });
                     }}
                     className="rounded-xl p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                     title={t("editModule")}
                   >
                     <Edit2 className="size-4" />
                   </button>
                 )}
                 <button 
                   onClick={() => handleDeleteModule(module.id)}
                   disabled={loading === module.id}
                   className="rounded-xl p-2 text-destructive hover:bg-destructive/10 transition-all"
                   title={tCommon("delete")}
                 >
                   {loading === module.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                 </button>
              </div>
            </div>

            {/* Lessons List */}
            {expandedModules.includes(module.id) && (
              <div className="p-5 pt-0 space-y-3">
                <div className="space-y-2 border-l-2 border-muted ml-8 pl-6 py-4">
                  {module.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-2xl border bg-background p-4 shadow-xs transition-all hover:border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">
                          {lesson.type === 'video' && <Video className="size-4 text-blue-500" />}
                          {lesson.type === 'article' && <FileText className="size-4 text-emerald-500" />}
                          {lesson.type === 'quiz' && <HelpCircle className="size-4 text-amber-500" />}
                        </div>
                        <p className="text-xs font-bold text-foreground">{tDb(lesson.title, locale)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/${locale}/studio/courses/${courseId}/edit/lessons/${lesson.id}` as any}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                          title={tCommon("edit")}
                        >
                          <Edit2 className="size-3" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={loading === lesson.id}
                          className="rounded-lg p-2 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-all"
                          title={tCommon("delete")}
                        >
                          {loading === lesson.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Lesson Actions */}
                {addingLesson && addingLesson.moduleId === module.id ? (
                  <form onSubmit={handleSubmitLesson} className="ml-8 pl-6 mt-4 border-l-2 border-primary space-y-4">
                     <p className="text-xs font-bold uppercase text-primary flex items-center gap-2">
                        {addingLesson.type === 'video' && <Video className="size-3.5" />}
                        {addingLesson.type === 'article' && <FileText className="size-3.5" />}
                        {addingLesson.type === 'quiz' && <HelpCircle className="size-3.5" />}
                        {t("addLesson")} ({addingLesson.type.toUpperCase()})
                     </p>
                     
                     <MultiLangInput
                       label={t("addLesson")}
                       namePrefix="newLessonTitle"
                       placeholder={`${addingLesson.type}...`}
                       onChange={(val) => setNewLessonTitles(val)}
                       required
                     />

                     <div className="flex items-center gap-2">
                       <button 
                         type="submit" 
                         disabled={loading === `${addingLesson.moduleId}-${addingLesson.type}`} 
                         className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-primary/20"
                       >
                         {loading === `${addingLesson.moduleId}-${addingLesson.type}` ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                         <span>{t("saveLesson")}</span>
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setAddingLesson(null)} 
                         className="rounded-xl bg-muted px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/80"
                       >
                         {tCommon("cancel")}
                       </button>
                     </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 ml-8 pl-6">
                     <button 
                       onClick={() => {
                         setAddingLesson({ moduleId: module.id, type: "video" });
                         setNewLessonTitles({ id: "" });
                       }}
                       className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all"
                     >
                       <Video className="size-3" /> + Video
                     </button>
                     <button 
                       onClick={() => {
                         setAddingLesson({ moduleId: module.id, type: "article" });
                         setNewLessonTitles({ id: "" });
                       }}
                       className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
                     >
                       <FileText className="size-3" /> + Article
                     </button>
                     <button 
                       onClick={() => {
                         setAddingLesson({ moduleId: module.id, type: "quiz" });
                         setNewLessonTitles({ id: "" });
                       }}
                       className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
                     >
                       <HelpCircle className="size-3" /> + Quiz
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Module Block */}
      {addingModule ? (
        <form onSubmit={handleSubmitModule} className="rounded-2xl border bg-card/50 shadow-sm p-6 space-y-4">
           <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{t("addModule")}</h3>
           
           <MultiLangInput
             label={t("addModule")}
             namePrefix="newModuleTitle"
             placeholder="Introduction, Chapter 1..."
             onChange={(val) => setNewModuleTitles(val)}
             required
           />

           <div className="flex items-center gap-3 justify-end pt-2">
             <button type="button" onClick={() => setAddingModule(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted">{tCommon("cancel")}</button>
             <button type="submit" disabled={loading === "module-new"} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-md shadow-primary/20">
                {loading === "module-new" ? <Loader2 className="size-4 animate-spin" /> : t("saveModule")}
             </button>
           </div>
        </form>
      ) : (
        <button 
          onClick={() => {
            setAddingModule(true);
            setNewModuleTitles({ id: "" });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-muted py-8 text-sm font-black uppercase tracking-widest text-muted-foreground hover:border-primary/30 hover:text-primary transition-all group"
        >
          <>
            <Plus className="size-6 transition-transform group-hover:scale-125" />
            {t("addModule")}
          </>
        </button>
      )}
    </div>
  );
}
