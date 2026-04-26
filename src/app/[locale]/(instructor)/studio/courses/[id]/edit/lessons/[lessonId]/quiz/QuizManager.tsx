"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Loader2, GripVertical, ChevronDown, ChevronRight, Globe, Languages } from "lucide-react";
import { addQuestion, updateQuestion, deleteQuestion, addChoice, updateChoice, deleteChoice } from "@/actions/quiz-builder";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

export function QuizManager({ courseId, quizId, initialQuestions, locale }: { courseId: string, quizId: string, initialQuestions: any[], locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [questions, setQuestions] = useState(initialQuestions);

  const handleAddQuestion = async () => {
    setLoading("add-question");
    try {
      const result = await addQuestion(courseId, quizId);
      if (result.success) {
        toast.success("Pertanyaan berhasil ditambahkan");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    setLoading(qId);
    try {
      const result = await deleteQuestion(courseId, qId);
      if (result.success) {
        toast.success("Pertanyaan berhasil dihapus");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAddChoice = async (qId: string) => {
    setLoading(`add-choice-${qId}`);
    try {
      const result = await addChoice(courseId, qId);
      if (result.success) {
        toast.success("Pilihan berhasil ditambahkan");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteChoice = async (cId: string) => {
    setLoading(cId);
    try {
      const result = await deleteChoice(courseId, cId);
      if (result.success) {
        toast.success("Pilihan berhasil dihapus");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateChoice = async (cId: string, data: any) => {
    setLoading(cId);
    try {
      await updateChoice(courseId, cId, data);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateQuestion = async (qId: string, data: any) => {
    setLoading(qId);
    try {
      await updateQuestion(courseId, qId, data);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        {initialQuestions.map((q, qIndex) => (
          <div key={q.id} className="group overflow-hidden rounded-2xl border bg-card/50 shadow-sm transition-all hover:border-amber-500/30">
            <div className="p-8 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-white shadow-lg shadow-amber-500/20">
                        {qIndex + 1}
                     </span>
                     <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pertanyaan</h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    disabled={loading === q.id}
                    className="rounded-xl p-2 text-destructive/40 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    {loading === q.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </button>
               </div>

               <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="size-3" /> Indonesia
                     </label>
                     <textarea 
                       defaultValue={q.questionId}
                       onBlur={(e) => handleUpdateQuestion(q.id, { questionId: e.target.value })}
                       className="w-full rounded-2xl border bg-background/50 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all resize-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Languages className="size-3" /> English
                     </label>
                     <textarea 
                       defaultValue={q.questionEn}
                       onBlur={(e) => handleUpdateQuestion(q.id, { questionEn: e.target.value })}
                       className="w-full rounded-2xl border bg-background/50 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all resize-none"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pilihan Jawaban</h4>
                  <div className="grid gap-3">
                     {q.choices.map((choice: any) => (
                       <div key={choice.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                         choice.isCorrect ? 'border-emerald-500/50 bg-emerald-500/5 shadow-inner' : 'bg-background/30'
                       }`}>
                          <button 
                            onClick={() => handleUpdateChoice(choice.id, { isCorrect: true })}
                            className={`flex size-6 items-center justify-center rounded-full transition-all ${
                              choice.isCorrect ? 'bg-emerald-500 text-white' : 'border-2 text-transparent'
                            }`}
                          >
                             <CheckCircle2 className="size-4" />
                          </button>
                          <div className="grid flex-1 gap-4 sm:grid-cols-2">
                             <input 
                               defaultValue={choice.textId}
                               onBlur={(e) => handleUpdateChoice(choice.id, { textId: e.target.value })}
                               className="bg-transparent text-sm font-medium outline-hidden"
                               placeholder="Pilihan (ID)"
                             />
                             <input 
                               defaultValue={choice.textEn}
                               onBlur={(e) => handleUpdateChoice(choice.id, { textEn: e.target.value })}
                               className="bg-transparent text-sm font-medium outline-hidden"
                               placeholder="Choice (EN)"
                             />
                          </div>
                          <button 
                            onClick={() => handleDeleteChoice(choice.id)}
                            disabled={loading === choice.id}
                            className="text-muted-foreground/30 hover:text-destructive transition-all"
                          >
                             {loading === choice.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                       </div>
                     ))}
                     <button 
                       onClick={() => handleAddChoice(q.id)}
                       disabled={loading === `add-choice-${q.id}`}
                       className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-muted p-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:border-amber-500/30 hover:text-amber-500 transition-all"
                     >
                        {loading === `add-choice-${q.id}` ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                        Tambah Pilihan
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleAddQuestion}
        disabled={loading === "add-question"}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border-4 border-dashed border-muted py-10 text-sm font-black uppercase tracking-widest text-muted-foreground hover:border-amber-500/20 hover:text-amber-500 transition-all group"
      >
        {loading === "add-question" ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <>
            <Plus className="size-6 transition-transform group-hover:scale-125" />
            Tambah Pertanyaan Baru
          </>
        )}
      </button>
    </div>
  );
}
