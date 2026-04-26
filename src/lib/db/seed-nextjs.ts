import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding Next.js 15 Course...");

  const targetSlug = "mastering-nextjs-15-react-19";

  // Cleanup existing course with this slug to allow re-seeding
  const existingCourse = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.slug, targetSlug),
  });

  if (existingCourse) {
    console.log(`Deleting existing course: ${targetSlug}`);
    await db.delete(schema.courses).where(eq(schema.courses.slug, targetSlug));
  }

  // Get existing Category
  let category = await db.query.categories.findFirst({
    where: (cats, { eq }) => eq(cats.slug, "web-development"),
  });

  if (!category) {
    [category] = await db.insert(schema.categories).values({
      id: crypto.randomUUID(),
      name: "Web Development",
      slug: "web-development",
      icon: "code",
      nameEn: "Web Development",
      nameId: "Pengembangan Web",
    }).returning();
  }

  // Get existing Instructor
  let instructor = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, "dummy-instructor-id"),
  });

  if (!instructor) {
    [instructor] = await db.insert(schema.users).values({
      id: "dummy-instructor-id",
      name: "Instructor Ajar",
      email: "instructor@ajar.com",
      role: "instructor",
    }).returning();
  }

  // Insert Course
  const [course] = await db.insert(schema.courses).values({
    id: crypto.randomUUID(),
    slug: "mastering-nextjs-15-react-19",
    titleEn: "Mastering Next.js 15 & React 19",
    titleId: "Mastering Next.js 15 & React 19",
    descEn: "Learn the latest features of Next.js 15 and React 19 by building a real-world LMS application.",
    descId: "Pelajari fitur terbaru Next.js 15 dan React 19 dengan membangun aplikasi LMS nyata.",
    level: "intermediate",
    status: "published",
    price: "1", // Harga Rp 1
    currency: "IDR",
    authorId: instructor.id,
    categoryId: category.id,
  }).returning();

  // Module 1: Introduction
  const [mod1] = await db.insert(schema.modules).values({
    id: crypto.randomUUID(),
    courseId: course.id,
    titleEn: "Getting Started with Next.js 15",
    titleId: "Persiapan Next.js 15",
    order: 1,
  }).returning();

  await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      titleEn: "Introduction to Next.js 15",
      titleId: "Pengenalan Next.js 15",
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
      duration: 10,
      order: 1,
      isFree: true,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      titleEn: "The Future of React: React 19",
      titleId: "Masa Depan React: React 19",
      type: "article",
      contentId: `# Mengenal React 19 dan Next.js 15

React 19 membawa perubahan fundamental pada cara kita mengelola state dan efek samping. Beberapa fitur utama meliputi:

1. **Actions API**: Cara baru untuk menangani transisi data secara asinkron tanpa harus mengelola state 'loading' secara manual.
2. **Server Components**: Dukungan penuh yang sudah terintegrasi erat dengan Next.js App Router.
3. **New Hooks**: Seperti \`useActionState\` dan \`useFormStatus\` yang mempermudah interaksi form.

Next.js 15 menyempurnakan ini dengan:
- **Default Caching Update**: \`fetch\` sekarang secara default adalah \`no-store\`, memberikan kontrol penuh kepada developer.
- **Partial Prerendering (PPR)**: Menggabungkan kelebihan static rendering dan dynamic rendering dalam satu halaman yang sama.

Mari kita mulai perjalanan ini dengan memahami dasar-dasarnya!`,
      duration: 15,
      order: 2,
      isFree: true,
    }
  ]);

  // Module 2: Deep Dive
  const [mod2] = await db.insert(schema.modules).values({
    id: crypto.randomUUID(),
    courseId: course.id,
    titleEn: "Server Components & Actions",
    titleId: "Server Components & Actions",
    order: 2,
  }).returning();

  const lessonsMod2 = await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      titleEn: "Mastering React Server Components",
      titleId: "Menguasai React Server Components",
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=rGPpQdxFm8w",
      duration: 25,
      order: 1,
      isFree: false,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      titleEn: "How Server Actions Work",
      titleId: "Cara Kerja Server Actions",
      type: "article",
      contentId: `# Memahami Server Actions

Server Actions adalah fungsi asinkron yang dieksekusi di server. Mereka dapat dipanggil langsung dari Client Components atau Server Components.

## Keuntungan Utama:
- **Zero Client-side JS**: Logika mutasi data tidak perlu dikirim ke browser.
- **Progressive Enhancement**: Form tetap bekerja bahkan sebelum JavaScript dimuat di browser.
- **Keamanan**: Logika sensitif tetap berada di lingkungan server yang aman.

### Contoh Sederhana:
\`\`\`typescript
async function createPost(formData: FormData) {
  'use server';
  const content = formData.get('content');
  await db.insert(posts).values({ content });
}
\`\`\`

Dengan Server Actions, Anda tidak perlu lagi membuat API Route terpisah untuk setiap mutasi data!`,
      duration: 20,
      order: 2,
      isFree: false,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      titleEn: "Quiz: Next.js 15 Concepts",
      titleId: "Quiz: Konsep Next.js 15",
      type: "quiz",
      duration: 20,
      order: 3,
      isFree: false,
    }
  ]).returning();

  // Find the quiz lesson
  const quizLesson = lessonsMod2.find(l => l.type === "quiz")!;

  // Quiz Setup
  const [quiz] = await db.insert(schema.quizzes).values({
    id: crypto.randomUUID(),
    lessonId: quizLesson.id,
  }).returning();

  // Question 1
  const [q1] = await db.insert(schema.quizQuestions).values({
    id: crypto.randomUUID(),
    quizId: quiz.id,
    questionEn: "What is the default caching behavior for fetch in Next.js 15?",
    questionId: "Bagaimana perilaku caching default fetch di Next.js 15?",
    order: 1,
  }).returning();

  await db.insert(schema.quizChoices).values([
    { id: crypto.randomUUID(), questionId: q1.id, textEn: "Force-cache", textId: "Force-cache", isCorrect: false },
    { id: crypto.randomUUID(), questionId: q1.id, textEn: "No-store", textId: "No-store", isCorrect: true },
    { id: crypto.randomUUID(), questionId: q1.id, textEn: "Revalidate", textId: "Revalidate", isCorrect: false },
  ]);

  // Question 2
  const [q2] = await db.insert(schema.quizQuestions).values({
    id: crypto.randomUUID(),
    quizId: quiz.id,
    questionEn: "Which directive marks a component as a Client Component?",
    questionId: "Direktif mana yang menandai komponen sebagai Client Component?",
    order: 2,
  }).returning();

  await db.insert(schema.quizChoices).values([
    { id: crypto.randomUUID(), questionId: q2.id, textEn: "'use client'", textId: "'use client'", isCorrect: true },
    { id: crypto.randomUUID(), questionId: q2.id, textEn: "'use server'", textId: "'use server'", isCorrect: false },
    { id: crypto.randomUUID(), questionId: q2.id, textEn: "'client side'", textId: "'client side'", isCorrect: false },
  ]);

  console.log("Seeding Next.js course complete!");
}

main().catch(console.error);
