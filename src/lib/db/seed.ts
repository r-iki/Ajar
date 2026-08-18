import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.quizChoices);
  await db.delete(schema.quizQuestions);
  await db.delete(schema.quizzes);
  await db.delete(schema.lessons);
  await db.delete(schema.modules);
  await db.delete(schema.courses);
  await db.delete(schema.categories);
  await db.delete(schema.users);

  // Categories
  const [catWeb] = await db.insert(schema.categories).values({
    id: crypto.randomUUID(),
    slug: "web-development",
    icon: "code",
    name: {
      en: "Web Development",
      id: "Pengembangan Web",
    },
  }).returning();

  // Dummy User
  const [user] = await db.insert(schema.users).values({
    id: "dummy-instructor-id",
    name: "Instructor Ajar",
    email: "instructor@ajar.com",
    role: "instructor",
  }).onConflictDoUpdate({
    target: schema.users.email,
    set: { name: "Instructor Ajar" },
  }).returning();

  // Courses
  const [courseJs] = await db.insert(schema.courses).values({
    id: crypto.randomUUID(),
    slug: "belajar-fundamental-javascript",
    title: {
      en: "Modern JavaScript Fundamentals",
      id: "Dasar JavaScript Modern",
    },
    description: {
      en: "Learn modern JavaScript from scratch.",
      id: "Belajar dasar JavaScript modern dari nol.",
    },
    level: "beginner",
    status: "published",
    price: "150000",
    currency: "IDR",
    authorId: user.id,
    categoryId: catWeb.id,
  }).returning();

  // Modules
  const [mod1] = await db.insert(schema.modules).values({
    id: crypto.randomUUID(),
    courseId: courseJs.id,
    title: {
      en: "Introduction to JavaScript",
      id: "Pengenalan JavaScript",
    },
    order: 1,
  }).returning();

  const [mod2] = await db.insert(schema.modules).values({
    id: crypto.randomUUID(),
    courseId: courseJs.id,
    title: {
      en: "Variables and Data Types",
      id: "Variabel dan Tipe Data",
    },
    order: 2,
  }).returning();

  // Lessons for Module 1
  await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      title: {
        en: "Welcome to the Course",
        id: "Selamat Datang di Kursus",
      },
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
      duration: 5,
      order: 1,
      isFree: true,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      title: {
        en: "What is JavaScript?",
        id: "Apa itu JavaScript?",
      },
      type: "article",
      content: {
        en: "# What is JavaScript?\n\nJavaScript is the most popular programming language for web development.",
        id: "# Apa itu JavaScript?\n\nJavaScript adalah bahasa pemrograman paling populer untuk pengembangan web.",
      },
      duration: 10,
      order: 2,
      isFree: true,
    }
  ]);

  // Lessons for Module 2
  const [lessonQuiz] = await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      title: {
        en: "Const and Let",
        id: "Const dan Let",
      },
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=sjyJBL5fkp8",
      duration: 12,
      order: 1,
      isFree: false,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      title: {
        en: "Quiz Dasar JS",
        id: "Quiz Dasar JS",
      },
      type: "quiz",
      duration: 15,
      order: 2,
      isFree: false,
    }
  ]).returning();

  // Quiz for Lesson 4
  const [quiz] = await db.insert(schema.quizzes).values({
    id: crypto.randomUUID(),
    lessonId: lessonQuiz.id,
  }).returning();

  const [q1] = await db.insert(schema.quizQuestions).values({
    id: crypto.randomUUID(),
    quizId: quiz.id,
    question: {
      en: "Which keyword is for constant values?",
      id: "Keyword mana untuk nilai konstan?",
    },
    order: 1,
  }).returning();

  await db.insert(schema.quizChoices).values([
    { id: crypto.randomUUID(), questionId: q1.id, text: { en: "let", id: "let" }, isCorrect: false },
    { id: crypto.randomUUID(), questionId: q1.id, text: { en: "const", id: "const" }, isCorrect: true },
    { id: crypto.randomUUID(), questionId: q1.id, text: { en: "var", id: "var" }, isCorrect: false },
  ]);

  console.log("Seeding complete!");
}

main().catch(console.error);
