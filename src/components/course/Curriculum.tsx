"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText, HelpCircle, Lock } from "lucide-react";

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

export function Curriculum({ modules }: { modules: Module[] }) {
  const [openModules, setOpenModules] = useState<string[]>([modules[0]?.id]);

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
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
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Module {module.lessons.length} Lessons</p>
                <h3 className="text-lg font-bold">{module.titleId}</h3>
              </div>
              {openModules.includes(module.id) ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {openModules.includes(module.id) && (
              <div className="bg-muted/30 pb-2">
                {module.lessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className="flex items-center justify-between border-t border-border/50 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getIcon(lesson.type)}
                      </div>
                      <span className="text-sm font-medium">{lesson.titleId}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                      {!lesson.isFree && <Lock className="size-3 text-muted-foreground/50" />}
                      {lesson.isFree && (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500 uppercase">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
