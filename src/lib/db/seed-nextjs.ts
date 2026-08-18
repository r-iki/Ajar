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
      slug: "web-development",
      icon: "code",
      name: {
        en: "Web Development",
        id: "Pengembangan Web",
      },
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
    title: {
      en: "Mastering Next.js 15 & React 19",
      id: "Mastering Next.js 15 & React 19",
    },
    description: {
      en: "Learn the latest features of Next.js 15 and React 19 by building a real-world LMS application.",
      id: "Pelajari fitur terbaru Next.js 15 dan React 19 dengan membangun aplikasi LMS nyata.",
    },
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
    title: {
      en: "Getting Started with Next.js 15",
      id: "Persiapan Next.js 15",
    },
    order: 1,
  }).returning();

  await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      title: {
        en: "Introduction to Next.js 15",
        id: "Pengenalan Next.js 15",
      },
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
      duration: 10,
      order: 1,
      isFree: true,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod1.id,
      title: {
        en: "The Future of React: React 19",
        id: "Masa Depan React: React 19",
      },
      type: "article",
      content: {
        en: `# Exploring React 19 and Next.js 15\n\nReact 19 brings fundamental changes to state management and side effects. Key features include:\n\n1. **Actions API**: Handle async data transitions without manual loading states.\n2. **Server Components**: Full support integrated with Next.js App Router.\n3. **New Hooks**: Like \`useActionState\` and \`useFormStatus\`.\n\nNext.js 15 enhances this with:\n- **Default Caching Update**: \`fetch\` defaults to \`no-store\`.\n- **Partial Prerendering (PPR)**: Combine static and dynamic rendering.`,
        id: `# Mengenal React 19 dan Next.js 15\n\nReact 19 membawa perubahan fundamental pada cara kita mengelola state dan efek samping. Beberapa fitur utama meliputi:\n\n1. **Actions API**: Cara baru untuk menangani transisi data secara asinkron tanpa harus mengelola state 'loading' secara manual.\n2. **Server Components**: Dukungan penuh yang sudah terintegrasi erat dengan Next.js App Router.\n3. **New Hooks**: Seperti \`useActionState\` dan \`useFormStatus\` yang mempermudah interaksi form.\n\nNext.js 15 menyempurnakan ini dengan:\n- **Default Caching Update**: \`fetch\` sekarang secara default adalah \`no-store\`, memberikan kontrol penuh kepada developer.\n- **Partial Prerendering (PPR)**: Menggabungkan kelebihan static rendering dan dynamic rendering dalam satu halaman yang sama.\n\nMari kita mulai perjalanan ini dengan memahami dasar-dasarnya!`,
      },
      duration: 15,
      order: 2,
      isFree: true,
    }
  ]);

  // Module 2: Deep Dive
  const [mod2] = await db.insert(schema.modules).values({
    id: crypto.randomUUID(),
    courseId: course.id,
    title: {
      en: "Server Components & Actions",
      id: "Server Components & Actions",
    },
    order: 2,
  }).returning();

  const lessonsMod2 = await db.insert(schema.lessons).values([
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      title: {
        en: "Mastering React Server Components",
        id: "Menguasai React Server Components",
      },
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=rGPpQdxFm8w",
      duration: 25,
      order: 1,
      isFree: false,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      title: {
        en: "How Server Actions Work",
        id: "Cara Kerja Server Actions",
      },
      type: "article",
      content: {
        en: `# Understanding Server Actions\n\nServer Actions are asynchronous functions executed on the server.\n\n## Key Advantages:\n- **Zero Client-side JS**: No mutation logic sent to browser.\n- **Progressive Enhancement**: Forms work before JavaScript loads.\n- **Security**: Sensitive logic stays on the server.\n\n### Simple Example:\n\`\`\`typescript\nasync function createPost(formData: FormData) {\n  'use server';\n  const content = formData.get('content');\n  await db.insert(posts).values({ content });\n}\n\`\`\``,
        id: `# Memahami Server Actions\n\nServer Actions adalah fungsi asinkron yang dieksekusi di server. Mereka dapat dipanggil langsung dari Client Components atau Server Components.\n\n## Keuntungan Utama:\n- **Zero Client-side JS**: Logika mutasi data tidak perlu dikirim ke browser.\n- **Progressive Enhancement**: Form tetap bekerja bahkan sebelum JavaScript dimuat di browser.\n- **Keamanan**: Logika sensitif tetap berada di lingkungan server yang aman.\n\n### Contoh Sederhana:\n\`\`\`typescript\nasync function createPost(formData: FormData) {\n  'use server';\n  const content = formData.get('content');\n  await db.insert(posts).values({ content });\n}\n\`\`\`\n\nDengan Server Actions, Anda tidak perlu lagi membuat API Route terpisah untuk setiap mutasi data!`,
      },
      duration: 20,
      order: 2,
      isFree: false,
    },
    {
      id: crypto.randomUUID(),
      moduleId: mod2.id,
      title: {
        en: "Quiz: Next.js 15 Concepts",
        id: "Quiz: Konsep Next.js 15",
      },
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
    question: {
      en: "What is the default caching behavior for fetch in Next.js 15?",
      id: "Bagaimana perilaku caching default fetch di Next.js 15?",
    },
    order: 1,
  }).returning();

  await db.insert(schema.quizChoices).values([
    { id: crypto.randomUUID(), questionId: q1.id, text: { en: "Force-cache", id: "Force-cache" }, isCorrect: false },
    { id: crypto.randomUUID(), questionId: q1.id, text: { en: "No-store", id: "No-store" }, isCorrect: true },
    { id: crypto.randomUUID(), questionId: q1.id, text: { en: "Revalidate", id: "Revalidate" }, isCorrect: false },
  ]);

  // Question 2
  const [q2] = await db.insert(schema.quizQuestions).values({
    id: crypto.randomUUID(),
    quizId: quiz.id,
    question: {
      en: "Which directive marks a component as a Client Component?",
      id: "Direktif mana yang menandai komponen sebagai Client Component?",
    },
    order: 2,
  }).returning();

  await db.insert(schema.quizChoices).values([
    { id: crypto.randomUUID(), questionId: q2.id, text: { en: "'use client'", id: "'use client'" }, isCorrect: true },
    { id: crypto.randomUUID(), questionId: q2.id, text: { en: "'use server'", id: "'use server'" }, isCorrect: false },
    { id: crypto.randomUUID(), questionId: q2.id, text: { en: "'client side'", id: "'client side'" }, isCorrect: false },
  ]);

  console.log("Seeding Next.js course complete!");
}

main().catch(console.error);
