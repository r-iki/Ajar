"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitQuizAttempt } from "@/actions/quiz";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

type QuizEngineProps = {
  userId: string;
  quizId: string;
  lessonId: string;
  questions: QuizQuestion[];
};

export function QuizEngine({ userId, quizId, lessonId, questions }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; percentage: number; passed: boolean; nextLessonId?: string | null } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async () => {
    const selectedAnswers = questions.map((q) => answers[q.id] || "");
    const correctAnswers = questions.map((q) => q.options.find((o) => o.isCorrect)?.id || "");

    startTransition(async () => {
      try {
        const res = await submitQuizAttempt({
          userId,
          quizId,
          lessonId,
          selectedAnswers,
          correctAnswers,
        });
        setResult(res);
        setSubmitted(true);
        
        if (res.passed) {
          toast.success(`Lulus Quiz! Skor Anda: ${res.percentage}%`);
        } else {
          toast.error(`Belum Lulus. Skor Anda: ${res.percentage}%`);
        }
      } catch (error) {
        toast.error("Gagal mengirim jawaban.");
      }
    });
  };

  const handleNext = () => {
    if (result?.nextLessonId) {
      router.push(`/learn/${window.location.pathname.split("/")[3]}/${result.nextLessonId}`);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-8 rounded-2xl border glass p-8 shadow-2xl">
      <div className="space-y-2 border-b pb-4">
        <h3 className="text-2xl font-black">Quiz Pengetahuan</h3>
        <p className="text-sm text-muted-foreground font-medium">Selesaikan quiz ini dengan skor minimal 80% untuk melanjutkan.</p>
      </div>

      <div className="space-y-10">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <legend className="text-lg font-black leading-relaxed flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shadow-lg">
                {index + 1}
              </span>
              {question.prompt}
            </legend>
            <div className="grid gap-3 pl-11">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.id;
                const isCorrect = option.isCorrect;
                const showResult = submitted;

                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 text-sm font-bold transition-all active:scale-[0.98]
                      ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted/50"}
                      ${showResult && isCorrect ? "border-green-500 bg-green-500/10 ring-green-500/20" : ""}
                      ${showResult && isSelected && !isCorrect ? "border-destructive bg-destructive/10 ring-destructive/20" : ""}
                    `}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                      disabled={submitted || isPending}
                      className="size-5 accent-primary"
                    />
                    <span className="flex-1">{option.text}</span>
                    {showResult && isCorrect && <span className="text-[10px] font-black tracking-tighter text-green-600 bg-green-600/10 px-2 py-1 rounded">BENAR</span>}
                    {showResult && isSelected && !isCorrect && <span className="text-[10px] font-black tracking-tighter text-destructive bg-destructive/10 px-2 py-1 rounded">SALAH</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 border-t pt-8 sm:flex-row sm:justify-between">
        {!submitted ? (
          <button
            type="button"
            disabled={isPending || Object.keys(answers).length < questions.length}
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-primary px-10 py-4 font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 sm:w-auto"
          >
            {isPending ? "Sedang Mengirim..." : "SUBMIT JAWABAN"}
          </button>
        ) : (
          <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className={`flex items-center gap-4 rounded-2xl p-6 ${result?.passed ? "bg-green-500/10 border-green-500/20 border" : "bg-destructive/10 border-destructive/20 border"}`}>
              <div className="text-4xl font-black">{result?.percentage}%</div>
              <div>
                <div className="text-lg font-black">{result?.passed ? "LULUS!" : "BELUM LULUS"}</div>
                <div className="text-xs font-bold opacity-70 uppercase tracking-widest">Skor: {result?.score}/{questions.length}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!result?.passed && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setResult(null);
                    setAnswers({});
                  }}
                  className="rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:bg-muted"
                >
                  Coba Lagi
                </button>
              )}
              {result?.passed && (
                <button
                  onClick={handleNext}
                  className="rounded-xl bg-green-600 px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  LANJUT KE MATERI BERIKUTNYA
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
