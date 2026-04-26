"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText, HelpCircle, Lock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

type Lesson = {
  id: string;
  titleId: string;
  type: "video" | "article" | "quiz";
  duration: number;
  isFree: boolean;
};

type Module = {
  id: string;
  titleId: string;
  lessons: Lesson[];
};

export function Curriculum({ 
  modules, 
  isEnrolled, 
  courseSlug 
}: { 
  modules: Module[], 
  isEnrolled: boolean, 
  courseSlug: string 
}) {
  const router = useRouter();
  const [openModules, setOpenModules] = useState<string[]>([modules[0]?.id]);

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleLessonClick = (lessonId: string) => {
    if (isEnrolled) {
      router.push(`/learn/${courseSlug}/${lessonId}`);
    } else {
      const enrollSection = document.getElementById("enroll-section");
      if (enrollSection) {
        enrollSection.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight effect to the sidebar
        const sidebar = enrollSection.querySelector(".rounded-2xl");
        if (sidebar) {
          sidebar.classList.add("ring-4", "ring-primary", "scale-105");
          setTimeout(() => {
            sidebar.classList.remove("ring-4", "ring-primary", "scale-105");
          }, 1000);
        }
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <PlayCircle className="size-4" />;
      case "article": return <FileText className="size-4" />;
      case "quiz": return <HelpCircle className="size-4" />;
      default: return <FileText className="size-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Kurikulum Kursus</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border bg-card/50 shadow-sm">
        {modules.map((module) => (
          <div key={module.id} className="group">
            <button
              onClick={() => toggleModule(module.id)}
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Module • {module.lessons.length} Lessons</p>
                <h3 className="text-lg font-bold">{module.titleId}</h3>
              </div>
              {openModules.includes(module.id) ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {openModules.includes(module.id) && (
              <div className="bg-muted/10 pb-2">
                {module.lessons.map((lesson) => (
                  <button 
                    key={lesson.id} 
                    onClick={() => handleLessonClick(lesson.id)}
                    className="flex w-full items-center justify-between border-t border-border/50 px-6 py-4 text-left transition-all hover:bg-primary/5 group/lesson"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground group-hover/lesson:text-primary transition-colors">
                        {getIcon(lesson.type)}
                      </div>
                      <span className="text-sm font-medium group-hover/lesson:text-primary transition-colors">{lesson.titleId}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                      {!isEnrolled && !lesson.isFree && <Lock className="size-3 text-muted-foreground/30" />}
                      {lesson.isFree && (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                          Free
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

