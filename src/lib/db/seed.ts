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
    name: "Web Development",
    slug: "web-development",
    icon: "code",
    nameEn: "Web Development",
    nameId: "Pengembangan Web",
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
    titleEn: "Modern JavaScript Fundamentals",
    titleId: "Dasar JavaScript Modern",
    descEn: "Learn modern JavaScript from scratch.",
    descId: "Belajar dasar JavaScript modern dari nol.",
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
    titleEn: "Introduction to JavaScript",
    titleId: "Pengenalan JavaScript",
    order: 1,
  }).returning();

  const [mod2] = await db.insert(schema.modules).values({
    id: crypto.randomUUID(),
    courseId: courseJs.id,
    titleEn: "Variables and Data Types",
    titleId: "Variabel dan Tipe Data",
    order: 2,
  }).returning();

  // Lessons for Module 1
  await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      titleEn: "Welcome to the Course",
      titleId: "Selamat Datang di Kursus",
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
      duration: 5,
      order: 1,
      isFree: true,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      titleEn: "What is JavaScript?",
      titleId: "Apa itu JavaScript?",
      type: "article",
      content: "# Apa itu JavaScript?\n\nJavaScript adalah bahasa pemrograman paling populer untuk pengembangan web.",
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
      titleEn: "Const and Let",
      titleId: "Const dan Let",
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=sjyJBL5fkp8",
      duration: 12,
      order: 1,
      isFree: false,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      titleEn: "Quiz Dasar JS",
      titleId: "Quiz Dasar JS",
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
    questionEn: "Which keyword is for constant values?",
    questionId: "Keyword mana untuk nilai konstan?",
    order: 1,
  }).returning();

  await db.insert(schema.quizChoices).values([
    { id: crypto.randomUUID(), questionId: q1.id, textEn: "let", textId: "let", isCorrect: false },
    { id: crypto.randomUUID(), questionId: q1.id, textEn: "const", textId: "const", isCorrect: true },
    { id: crypto.randomUUID(), questionId: q1.id, textEn: "var", textId: "var", isCorrect: false },
  ]);

  console.log("Seeding complete!");
}

main().catch(console.error);
