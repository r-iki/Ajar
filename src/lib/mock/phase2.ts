export type LessonKind = "video" | "article" | "quiz";

export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export type LessonContent = {
  id: string;
  title: string;
  type: LessonKind;
  durationMinutes: number;
  isFree: boolean;
  videoUrl?: string;
  articleMarkdown?: string;
  quiz?: QuizQuestion[];
};

export const sampleLessons: LessonContent[] = [
  {
    id: "1",
    title: "Intro JavaScript Modern",
    type: "video",
    durationMinutes: 12,
    isFree: true,
    videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
  },
  {
    id: "2",
    title: "Variable dan Scope",
    type: "article",
    durationMinutes: 15,
    isFree: false,
    articleMarkdown: `# Variable dan Scope\n\nPada JavaScript modern, gunakan **const** untuk nilai tetap dan **let** untuk nilai yang bisa berubah.\n\n## Contoh\n\n\`\`\`ts\nconst language = "TypeScript";\nlet completion = 0;\ncompletion += 10;\n\`\`\`\n\nScope block membantu mencegah konflik nama variabel ketika aplikasi sudah besar.`,
  },
  {
    id: "3",
    title: "Quiz Dasar JavaScript",
    type: "quiz",
    durationMinutes: 8,
    isFree: false,
    quiz: [
      {
        id: "q1",
        prompt: "Keyword mana yang tidak bisa di-reassign?",
        options: [
          { id: "q1o1", text: "let", isCorrect: false },
          { id: "q1o2", text: "const", isCorrect: true },
          { id: "q1o3", text: "var", isCorrect: false },
        ],
      },
      {
        id: "q2",
        prompt: "Apa hasil dari typeof []?",
        options: [
          { id: "q2o1", text: "array", isCorrect: false },
          { id: "q2o2", text: "object", isCorrect: true },
          { id: "q2o3", text: "list", isCorrect: false },
        ],
      },
    ],
  },
];
