"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2, Edit2, Video, FileText, HelpCircle, Loader2, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { createModule, deleteModule, updateModule, createLesson, deleteLesson } from "@/actions/curriculum";
import { toast } from "sonner";
import Link from "next/link";

export function CurriculumEditor({ courseId, initialModules, locale }: { courseId: string, initialModules: any[], locale: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(initialModules.map(m => m.id));

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitles, setEditModuleTitles] = useState({ id: "", en: "" });

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitles, setNewModuleTitles] = useState({ id: "", en: "" });

  const [addingLesson, setAddingLesson] = useState<{ moduleId: string; type: "video" | "article" | "quiz" } | null>(null);
  const [newLessonTitles, setNewLessonTitles] = useState({ id: "", en: "" });

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitles.id || !newModuleTitles.en) return;

    setLoading("module-new");
    try {
      const result = await createModule(courseId, newModuleTitles.id, newModuleTitles.en);
      if (result.success) {
        toast.success("Modul berhasil ditambahkan");
        setAddingModule(false);
        setNewModuleTitles({ id: "", en: "" });
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmitEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModuleId || !editModuleTitles.id || !editModuleTitles.en) return;

    setLoading(`edit-${editingModuleId}`);
    try {
      const result = await updateModule(courseId, editingModuleId, editModuleTitles.id, editModuleTitles.en);
      if (result.success) {
        toast.success("Modul berhasil diperbarui");
        setEditingModuleId(null);
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingLesson || !newLessonTitles.id || !newLessonTitles.en) return;

    setLoading(`${addingLesson.moduleId}-${addingLesson.type}`);
    try {
      const result = await createLesson(courseId, addingLesson.moduleId, { 
        titleId: newLessonTitles.id, 
        titleEn: newLessonTitles.en, 
        type: addingLesson.type 
      });
      if (result.success) {
        toast.success("Materi berhasil ditambahkan");
        setAddingLesson(null);
        setNewLessonTitles({ id: "", en: "" });
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Hapus modul ini dan semua materinya?")) return;
    
    setLoading(moduleId);
    try {
      const result = await deleteModule(courseId, moduleId);
      if (result.success) toast.success("Modul berhasil dihapus");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Hapus materi ini?")) return;
    
    setLoading(lessonId);
    try {
      const result = await deleteLesson(courseId, lessonId);
      if (result.success) toast.success("Materi berhasil dihapus");
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
                  <form onSubmit={handleSubmitEditModule} className="flex flex-1 items-center gap-3">
                    <input 
                      autoFocus 
                      required 
                      value={editModuleTitles.id} 
                      onChange={(e) => setEditModuleTitles(prev => ({...prev, id: e.target.value}))} 
                      className="flex-1 rounded-xl border bg-background px-3 py-1.5 text-xs font-bold" 
                      placeholder="Judul (ID)"
                    />
                    <input 
                      required 
                      value={editModuleTitles.en} 
                      onChange={(e) => setEditModuleTitles(prev => ({...prev, en: e.target.value}))} 
                      className="flex-1 rounded-xl border bg-background px-3 py-1.5 text-xs font-bold" 
                      placeholder="Title (EN)"
                    />
                    <div className="flex items-center gap-1">
                      <button type="submit" disabled={loading === `edit-${module.id}`} className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:opacity-90">
                        {loading === `edit-${module.id}` ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                      </button>
                      <button type="button" onClick={() => setEditingModuleId(null)} className="rounded-lg bg-muted p-1.5 text-muted-foreground hover:bg-muted/80">
                        <X className="size-3" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    {expandedModules.includes(module.id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-[10px] font-black text-primary-foreground">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-black uppercase tracking-tight">
                        {locale === 'id' ? module.titleId : module.titleEn}
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
                       setEditModuleTitles({ id: module.titleId, en: module.titleEn });
                     }}
                     className="rounded-xl p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                   >
                     <Edit2 className="size-4" />
                   </button>
                 )}
                 <button 
                   onClick={() => handleDeleteModule(module.id)}
                   disabled={loading === module.id}
                   className="rounded-xl p-2 text-destructive hover:bg-destructive/10 transition-all"
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
                          {lesson.type === 'video' && <Video className="size-4" />}
                          {lesson.type === 'article' && <FileText className="size-4" />}
                          {lesson.type === 'quiz' && <HelpCircle className="size-4" />}
                        </div>
                        <p className="text-xs font-bold">{locale === 'id' ? lesson.titleId : lesson.titleEn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/${locale}/studio/courses/${courseId}/edit/lessons/${lesson.id}`}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                          <Edit2 className="size-3" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={loading === lesson.id}
                          className="rounded-lg p-2 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          {loading === lesson.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Lesson Actions */}
                {addingLesson && addingLesson.moduleId === module.id ? (
                  <form onSubmit={handleSubmitLesson} className="ml-8 pl-6 mt-4 border-l-2 border-primary space-y-3">
                     <p className="text-xs font-bold uppercase text-primary flex items-center gap-2">
                        {addingLesson.type === 'video' && <Video className="size-3" />}
                        {addingLesson.type === 'article' && <FileText className="size-3" />}
                        {addingLesson.type === 'quiz' && <HelpCircle className="size-3" />}
                        Tambah {addingLesson.type} Baru
                     </p>
                     <div className="grid gap-3 sm:grid-cols-2">
                       <input autoFocus required value={newLessonTitles.id} onChange={(e) => setNewLessonTitles(prev => ({...prev, id: e.target.value}))} className="w-full rounded-xl border bg-background px-3 py-2 text-xs" placeholder={`Judul ${addingLesson.type} (Indonesia)`} />
                       <input required value={newLessonTitles.en} onChange={(e) => setNewLessonTitles(prev => ({...prev, en: e.target.value}))} className="w-full rounded-xl border bg-background px-3 py-2 text-xs" placeholder={`${addingLesson.type} Title (English)`} />
                     </div>
                     <div className="flex items-center gap-2">
                       <button type="submit" disabled={loading === `${addingLesson.moduleId}-${addingLesson.type}`} className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground disabled:opacity-50">
                         {loading === `${addingLesson.moduleId}-${addingLesson.type}` ? <Loader2 className="size-3 animate-spin" /> : "Simpan"}
                       </button>
                       <button type="button" onClick={() => setAddingLesson(null)} className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted">Batal</button>
                     </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 ml-8 pl-6">
                     <button 
                       onClick={() => setAddingLesson({ moduleId: module.id, type: "video" })}
                       className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-500/20 transition-all"
                     >
                       <Video className="size-3" /> + Video
                     </button>
                     <button 
                       onClick={() => setAddingLesson({ moduleId: module.id, type: "article" })}
                       className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/20 transition-all"
                     >
                       <FileText className="size-3" /> + Artikel
                     </button>
                     <button 
                       onClick={() => setAddingLesson({ moduleId: module.id, type: "quiz" })}
                       className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-500/20 transition-all"
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

      {addingModule ? (
        <form onSubmit={handleSubmitModule} className="rounded-2xl border bg-card/50 shadow-sm p-6 space-y-4">
           <h3 className="text-sm font-black uppercase tracking-tight">Tambah Modul Baru</h3>
           <div className="grid gap-4 sm:grid-cols-2">
             <div className="space-y-2">
               <label className="text-xs font-bold text-muted-foreground">Judul Modul (Indonesia)</label>
               <input autoFocus required value={newModuleTitles.id} onChange={(e) => setNewModuleTitles(prev => ({...prev, id: e.target.value}))} className="w-full rounded-xl border bg-background px-4 py-2 text-sm" placeholder="Contoh: Pengenalan Dasar" />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-muted-foreground">Module Title (English)</label>
               <input required value={newModuleTitles.en} onChange={(e) => setNewModuleTitles(prev => ({...prev, en: e.target.value}))} className="w-full rounded-xl border bg-background px-4 py-2 text-sm" placeholder="Example: Basic Introduction" />
             </div>
           </div>
           <div className="flex items-center gap-3 justify-end pt-2">
             <button type="button" onClick={() => setAddingModule(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted">Batal</button>
             <button type="submit" disabled={loading === "module-new"} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                {loading === "module-new" ? <Loader2 className="size-4 animate-spin" /> : "Simpan Modul"}
             </button>
           </div>
        </form>
      ) : (
        <button 
          onClick={() => setAddingModule(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-muted py-8 text-sm font-black uppercase tracking-widest text-muted-foreground hover:border-primary/20 hover:text-primary transition-all group"
        >
          <>
            <Plus className="size-6 transition-transform group-hover:scale-125" />
            Tambah Modul Baru
          </>
        </button>
      )}
    </div>
  );
}
