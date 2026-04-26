# 🎓 Ajar — LMS Implementation Plan (Final)

> Dicoding-style LMS · Deploy on **Vercel** · Free tier optimized

---

## ✅ Keputusan Final (Confirmed)

| Pertanyaan | Keputusan |
|---|---|
| Platform deploy | **Vercel** |
| Database | **Neon (PostgreSQL)** |
| Styling | **Tailwind CSS** |
| Video | **YouTube embed** (Phase 1) |
| Pembayaran | **Stripe + Midtrans** |
| Bahasa UI | **Bilingual (ID + EN)** |
| Arsitektur | **Monorepo Next.js full-stack** |
| Konten materi | **Markdown string di database** |

---

## 🛠️ Tech Stack Final

| Category | Choice | Keterangan |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack, Server Actions |
| **Language** | TypeScript (strict) | Type safety end-to-end |
| **Styling** | Tailwind CSS v4 | Utility-first, rapid UI |
| **UI Components** | shadcn/ui | Accessible, customizable |
| **ORM** | Drizzle ORM | Edge-safe, type-safe |
| **Database** | Neon (PostgreSQL) | Serverless, Vercel-native |
| **Auth** | Better Auth | OAuth + email/password |
| **Storage** | Cloudflare R2 | Thumbnail, attachment, file |
| **Video** | YouTube embed | Phase 1 gratis |
| **Pembayaran** | Stripe + Midtrans | Global + Indonesia |
| **i18n** | next-intl | Bilingual ID/EN |
| **Email** | Resend | Notifikasi, sertifikat |
| **PDF** | @react-pdf/renderer | Generate sertifikat |
| **Rich Text Editor** | Tiptap | Editor materi kursus |
| **Markdown Render** | MDX / marked + shiki | Syntax highlight kode |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **CI/CD** | GitHub Actions → Vercel | Auto deploy |

---

## 💰 Free Tier yang Dipakai

| Service | Free Allowance | Dipakai Untuk |
|---|---|---|
| **Vercel Hobby** | 100GB bandwidth, unlimited deploy | Hosting |
| **Neon** | 0.5GB DB, 100 compute-hr/mo | Database |
| **Cloudflare R2** | 10GB storage, 10M req/mo | File upload |
| **Resend** | 3,000 email/bulan | Notifikasi email |
| **Stripe** | 0% fee (pay per transaction) | Pembayaran global |
| **Midtrans** | 0% setup (pay per transaction) | Pembayaran Indonesia |

> [!NOTE]
> Total biaya awal: **Rp 0** sampai ada transaksi masuk.

---

## 🗄️ Database Schema

```sql
-- Users & Auth (dikelola Better Auth)
users            — id, name, email, avatar, role, xp, locale, createdAt
sessions         — Better Auth managed
accounts         — OAuth providers (Better Auth)

-- Katalog Kursus
categories       — id, name, slug, icon, nameEn, nameId
courses          — id, slug, title_en, title_id, desc_en, desc_id,
                   thumbnail, level, status, price, currency,
                   authorId, categoryId, createdAt
course_tags      — courseId, tag

-- Konten Kursus
modules          — id, courseId, title_en, title_id, order
lessons          — id, moduleId, title_en, title_id,
                   type (video|article|quiz),
                   content (markdown string),
                   video_url, duration, order, isFree

-- Quiz
quizzes          — id, lessonId
quiz_questions   — id, quizId, question_en, question_id, order
quiz_choices     — id, questionId, text_en, text_id, isCorrect
quiz_attempts    — id, userId, quizId, answers(json), score, submittedAt

-- Progress & Enrollment
enrollments      — id, userId, courseId, enrolledAt, completedAt,
                   certificateUrl, paymentStatus
lesson_progress  — id, userId, lessonId, completedAt

-- Sertifikat
certificates     — id, userId, courseId, code (unique), issuedAt

-- Gamifikasi
xp_transactions  — id, userId, amount, reason, createdAt
leaderboard      — (computed view)

-- Pembayaran
payments         — id, userId, courseId, amount, currency,
                   gateway (stripe|midtrans), gatewayId,
                   status, createdAt

-- Konten Komunitas
reviews          — id, userId, courseId, rating, comment, createdAt
comments         — id, userId, lessonId, content, createdAt, parentId

-- Learning Path
learning_paths   — id, title_en, title_id, desc_en, desc_id, thumbnail
path_courses     — pathId, courseId, order
```

---

## 📁 Struktur Folder

```
Ajar/
├── src/
│   ├── app/
│   │   ├── [locale]/               # next-intl locale wrapper
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx        # Landing page
│   │   │   │   ├── courses/        # Katalog kursus
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/page.tsx  # Detail kursus
│   │   │   │   └── paths/          # Learning paths
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/page.tsx
│   │   │   │   └── sign-up/page.tsx
│   │   │   ├── (student)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── my-courses/page.tsx
│   │   │   │   ├── learn/[courseSlug]/[lessonId]/page.tsx
│   │   │   │   └── certificates/page.tsx
│   │   │   ├── (instructor)/
│   │   │   │   └── studio/
│   │   │   │       ├── courses/page.tsx
│   │   │   │       └── courses/[id]/edit/page.tsx
│   │   │   └── (admin)/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       └── courses/page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts   # Better Auth handler
│   │       ├── webhooks/
│   │       │   ├── stripe/route.ts
│   │       │   └── midtrans/route.ts
│   │       └── r2/upload/route.ts       # R2 presigned URL
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── course/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseGrid.tsx
│   │   │   ├── LessonSidebar.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── lesson/
│   │   │   ├── VideoPlayer.tsx     # YouTube embed wrapper
│   │   │   ├── ArticleRenderer.tsx # Markdown → HTML
│   │   │   └── QuizEngine.tsx
│   │   ├── payment/
│   │   │   ├── CheckoutButton.tsx
│   │   │   └── PaymentModal.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts            # Drizzle + Neon client
│   │   │   └── schema.ts           # Semua table definitions
│   │   ├── auth/
│   │   │   └── index.ts            # Better Auth config
│   │   ├── r2/
│   │   │   └── upload.ts           # R2 presigned URL helper
│   │   ├── payment/
│   │   │   ├── stripe.ts
│   │   │   └── midtrans.ts
│   │   └── pdf/
│   │       └── certificate.tsx     # @react-pdf/renderer template
│   │
│   ├── actions/                    # Server Actions
│   │   ├── course.ts
│   │   ├── enrollment.ts
│   │   ├── lesson-progress.ts
│   │   ├── quiz.ts
│   │   ├── payment.ts
│   │   └── certificate.ts
│   │
│   ├── i18n/
│   │   ├── messages/
│   │   │   ├── id.json             # Bahasa Indonesia
│   │   │   └── en.json             # English
│   │   └── request.ts
│   │
│   └── middleware.ts               # Auth guard + i18n routing
│
├── drizzle/
│   └── migrations/                 # Auto-generated migrations
├── public/
├── .env.local
├── drizzle.config.ts
└── next.config.ts
```

---

## 🚀 Fase Pengembangan

### Phase 1 — Foundation (Minggu 1–2)
**Target:** App berjalan dengan auth, katalog kursus, dan lesson viewer dasar

- [ ] Scaffold Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui
- [ ] Setup Drizzle ORM + Neon PostgreSQL + generate schema
- [ ] Implement Better Auth (email/password + Google OAuth)
- [ ] Setup next-intl (bilingual ID/EN routing)
- [ ] Halaman publik: Landing page, katalog kursus, detail kursus
- [ ] Halaman student: Dashboard, My Courses
- [ ] Enrollment kursus gratis + YouTube video player
- [ ] Lesson progress tracking (mark complete)

**Deliverable:** Student bisa daftar, login, enroll kursus gratis, tonton video

---

### Phase 2 — Pembelajaran Lengkap (Minggu 3–4)
**Target:** Pengalaman belajar penuh — artikel, quiz, progress, sertifikat, payment

- [ ] Article lesson renderer (Markdown + Tiptap + Shiki syntax highlight)
- [ ] Quiz engine: multiple choice, scoring, hasil langsung
- [ ] Progress bar per kursus (% selesai)
- [ ] Generate sertifikat PDF otomatis saat kursus selesai
- [ ] Email notifikasi (enrollment, sertifikat) via Resend
- [ ] **Stripe integration** (kursus berbayar, global)
- [ ] **Midtrans integration** (kursus berbayar, Indonesia — VA, QRIS, GoPay)
- [ ] Webhook handler Stripe + Midtrans → update enrollment status

**Deliverable:** Student bisa beli kursus (Stripe/Midtrans), belajar, quiz, dapat sertifikat

---

### Phase 3 — Instructor & Admin Dashboard (Minggu 5)
**Target:** Instructor bisa buat kursus; admin kelola platform

- [ ] Instructor Studio: buat/edit kursus, modul, lesson
- [ ] Tiptap rich text editor untuk materi artikel
- [ ] Upload thumbnail/file ke Cloudflare R2 (presigned URL)
- [ ] Quiz builder: tambah soal + pilihan jawaban
- [ ] Set harga kursus (gratis / berbayar, IDR / USD)
- [ ] Admin: kelola user, approve kursus, lihat revenue
- [ ] Analytics sederhana: enrollment count, completion rate

**Deliverable:** Instructor bisa buat dan publish kursus berbayar/gratis

---

### Phase 4 — Gamifikasi & Komunitas (Minggu 6)
**Target:** Fitur engagement seperti Dicoding

- [ ] XP system — dapat XP dari selesaikan lesson, quiz, kursus
- [ ] Leaderboard (mingguan + all-time)
- [ ] Learning Paths: kurikulum terstruktur dari beberapa kursus
- [ ] Rating & review kursus
- [ ] Komentar per lesson (diskusi)
- [ ] Badge / achievement system

**Deliverable:** Platform terasa engaging dan community-driven

---

### Phase 5 — Polish & Deploy (Minggu 7)
**Target:** Production-ready, SEO, performa optimal

- [ ] SEO: sitemap.xml, metadata dinamis, og:image per kursus
- [ ] Image optimization (next/image)
- [ ] Lighthouse score ≥ 90 di halaman utama + kursus
- [ ] Responsive design (mobile-first)
- [ ] Error monitoring (Sentry free tier)
- [ ] GitHub Actions CI/CD → auto deploy ke Vercel
- [ ] Environment setup: development, staging, production
- [ ] Rate limiting di API routes (Upstash Redis free tier)

**Deliverable:** App siap launch ke publik

---

## 🌟 Fitur vs Dicoding

| Fitur | Dicoding | Ajar |
|---|---|---|
| Kursus gratis | ✅ | ✅ Phase 1 |
| Kursus berbayar | ✅ | ✅ Phase 2 (Stripe + Midtrans) |
| Video lesson | ✅ | ✅ Phase 1 (YouTube) |
| Artikel/materi | ✅ | ✅ Phase 2 |
| Quiz interaktif | ✅ | ✅ Phase 2 |
| Sertifikat PDF | ✅ | ✅ Phase 2 |
| Progress tracking | ✅ | ✅ Phase 1 |
| Learning path | ✅ | ✅ Phase 4 |
| Leaderboard | ✅ | ✅ Phase 4 |
| XP / Badge | ✅ | ✅ Phase 4 |
| Instructor tools | ✅ | ✅ Phase 3 |
| Admin panel | ✅ | ✅ Phase 3 |
| Bilingual | ❌ | ✅ Phase 1 |
| QRIS / GoPay | ✅ | ✅ Phase 2 (Midtrans) |

---

## ✅ Verification Plan

### Automated Tests
- **Vitest**: Server actions (enrollment, payment, progress, quiz scoring)
- **Playwright E2E**: Registration → browse catalog → enroll → watch lesson → quiz → certificate download
- **Playwright Payment**: Stripe checkout flow (test mode), Midtrans sandbox

### Manual Verification
- Test payment Midtrans sandbox (Virtual Account BCA, QRIS, GoPay)
- Test payment Stripe test card
- Test sertifikat PDF generate + download
- Test bilingual switching (ID ↔ EN)
- Lighthouse audit (target ≥ 90 performance, 100 accessibility)

---

> [!IMPORTANT]
> **Siap mulai Phase 1?**
> Semua keputusan sudah final. Langkah pertama: scaffold Next.js 15 + Tailwind + shadcn/ui + Drizzle + Neon + Better Auth.
