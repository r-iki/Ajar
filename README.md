<div align="center">

# 🎓 Ajar LMS

**Modern, Production-Ready, Bilingual Learning Management System Built with Next.js 15 & PostgreSQL.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat-square)](https://orm.drizzle.team/)
[![Live Demo](https://img.shields.io/badge/Demo-ajar.rikode.com-4f46e5?style=flat-square)](https://ajar.rikode.com)
[![Author](https://img.shields.io/badge/Author-Riki_Muhammad-emerald?style=flat-square)](https://rikode.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://ajar.rikode.com) • [Features](#-key-features) • [Architecture](#-project-architecture) • [Tech Stack](#-tech-stack) • [Quickstart](#-quickstart) • [Environment Variables](#-environment-variables) • [Database](#-database-management) • [Core Modules](#-core-modules-deep-dive) • [Deployment](#-production-deployment) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## ✨ Key Features

- 🌐 **Full Internationalization (i18n)**: Seamless English & Indonesian bilingual support with instant locale switching via `next-intl` and dual-language database fields.
- ⚡ **Next.js 15 & React 19**: Powered by Next.js App Router, Server Components, Server Actions, and Turbopack.
- 🔐 **Better Auth Authentication**: Complete auth suite with Email/Password, Google OAuth, Google One Tap, session management, and Role-Based Access Control (`student`, `instructor`, `admin`).
- 💳 **Dual Payment Gateways**:
  - **DOKU (Jokul)**: Indonesia's leading payment gateway supporting QRIS (GoPay, ShopeePay, DANA, OVO), Virtual Accounts (BCA, Mandiri, BRI, BNI), E-Wallets, and Credit Cards.
  - **Stripe**: International credit/debit card payments with webhooks.
- 📜 **Dynamic PDF Certificates**: Automated PDF certificate generator with `@react-pdf/renderer` featuring custom digital signatures and public QR code verification (`/v/[id]`).
- 🎮 **Gamification & XP System**: Real-time XP point tracking, multi-tier achievement badges, daily learning streaks, and a live global student leaderboard.
- 🛠️ **Instructor & Admin Studio**: Course creator with rich-text curriculum management, video player integration, interactive quiz builders, and student enrollment management.
- 🎨 **Modern Visual Craftsmanship**: Dark & Light mode toggle, Tailwind CSS v4, smooth animations, glassmorphism, and responsive mobile navigation.
- ☁️ **S3 / Cloudflare R2 Media Storage**: Scalable object storage for course thumbnails, avatars, and learning attachments.

---

## 🏗️ Project Architecture

```
ajar/
├── public/                 # Static assets, fonts, icons, branding
├── src/
│   ├── actions/            # Next.js Server Actions (Database queries & mutations)
│   │   ├── auth.ts         # User authentication & profile actions
│   │   ├── certificate.tsx # Certificate issuance & PDF rendering logic
│   │   ├── course.ts       # Public & student course browsing
│   │   ├── curriculum.ts   # Modules & lessons CRUD
│   │   ├── payment.ts      # Checkout sessions & gateway routing
│   │   ├── quiz.ts         # Quiz submission & scoring engine
│   │   └── xp.ts           # XP points & badge calculation
│   ├── app/
│   │   ├── [locale]/       # Localized route group (next-intl)
│   │   │   ├── (admin)/    # Admin panel (Users, Categories, Global Courses)
│   │   │   ├── (auth)/     # Sign-in & Sign-up pages
│   │   │   ├── (instructor)/ # Studio workspace (Course creation, Quiz builder)
│   │   │   ├── (public)/   # Landing page, Courses catalog, Legal & Contact
│   │   │   ├── (student)/  # Student dashboard, My Courses, XP, Leaderboard
│   │   │   └── v/[id]/     # Public verifiable certificate viewer
│   │   ├── api/            # API Route Handlers & Webhooks
│   │   │   ├── auth/       # Better-Auth catch-all handler
│   │   │   ├── certificates/ # PDF download endpoint
│   │   │   ├── r2/upload/  # Presigned S3/R2 direct uploads
│   │   │   └── webhooks/   # DOKU & Stripe asynchronous webhooks
│   │   ├── globals.css     # Tailwind CSS v4 theme definitions
│   │   └── sitemap.ts      # Dynamic XML Sitemap generator
│   ├── components/         # Reusable React UI Components
│   │   ├── admin/          # Admin management tables
│   │   ├── course/         # Course cards, filters, reviews, and progress bars
│   │   ├── layout/         # Navbar, Footer, MobileNav, Sidebar, ThemeToggle
│   │   ├── lesson/         # Video players, Markdown renderers, Quiz engine
│   │   ├── payment/        # Checkout buttons, Payment modals, Resume payment
│   │   ├── studio/         # Course form editors & multilingual inputs
│   │   └── ui/             # Base primitives
│   ├── i18n/               # Internationalization config & JSON translation dictionaries
│   │   ├── messages/       # id.json (Indonesian) & en.json (English)
│   │   ├── navigation.ts   # Localized Link, redirect, useRouter, usePathname
│   │   ├── request.ts      # Server request i18n resolver
│   │   └── routing.ts      # Supported locales & default prefixes
│   └── lib/                # Core utilities & Singletons
│       ├── auth/           # Better Auth server configuration
│       ├── db/             # Drizzle schema definitions, relations, and seeds
│       ├── email/          # Resend transactional mail client
│       ├── payment/        # DOKU Jokul & Stripe integration helpers
│       ├── pdf/            # React-PDF certificate templates
│       ├── r2/             # S3 / Cloudflare R2 bucket client
│       └── env.ts          # Zod-validated environment schema
├── drizzle.config.ts       # Drizzle Kit CLI configuration
├── next.config.ts          # Next.js compiler & domain image patterns
└── package.json            # Project dependencies & scripts
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Fullstack React framework with Server Actions & Turbopack |
| **UI Library** | [React 19](https://react.dev/) | Latest React features and concurrency primitives |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strictly typed for robust development |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation CSS framework with CSS variables |
| **Database & ORM** | [PostgreSQL (Neon)](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL ORM and serverless database |
| **Authentication** | [Better Auth](https://better-auth.com/) | Modern auth supporting credentials, OAuth & roles |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) | Type-safe bilingual routing and messages |
| **PDF Generation** | [@react-pdf/renderer](https://react-pdf.org/) | Declarative PDF rendering on the server |
| **Payment Gateways** | DOKU (Jokul) & Stripe | Indonesian & International payment integrations |
| **Storage** | Cloudflare R2 / AWS S3 | S3-compatible object storage via `@aws-sdk/client-s3` |

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v20.x or higher
- **PostgreSQL**: PostgreSQL 14+ (Local instance or Cloud provider like [Neon](https://neon.tech/))

### 1. Clone the Repository
```bash
git clone https://github.com/r-iki/Ajar.git
cd Ajar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the `.env.example` template into `.env.local`:
```bash
cp .env.example .env.local
```
Update `.env.local` with your database connection URL and Better Auth secret:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-32-char-random-secret-key"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ajar_dev?sslmode=disable"
```

### 4. Push Database Schema & Seed Data
```bash
# Push schema to database
npm run db:push

# Seed default demo courses, categories, lessons & quizzes
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

| Variable | Required | Description | Default / Example |
|---|:---:|---|---|
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public base URL of your application | `http://localhost:3000` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ajar_dev` |
| `BETTER_AUTH_SECRET` | **Yes** | Secret key for session signing | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | **Yes** | Auth server URL | `http://localhost:3000` |
| `NEXT_PUBLIC_BRAND_NAME` | No | Display brand name | `"Ajar LMS"` |
| `NEXT_PUBLIC_SIGNER_NAME` | No | Certificate authority signatory | `"Lead Instructor"` |
| `NEXT_PUBLIC_SIGNER_TITLE` | No | Signatory title | `"CEO & Founder"` |
| `NEXT_PUBLIC_SUPPORT_EMAIL`| No | Support contact email | `"support@example.com"` |
| `NEXT_PUBLIC_SUPPORT_PHONE`| No | Support phone / WhatsApp | `"+62 800-0000-0000"` |
| `NEXT_PUBLIC_COMPANY_ADDRESS` | No | Physical company address | `"Bandung, Indonesia"` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth Client Secret | Optional |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google One Tap Client ID | Optional |
| `NEXT_PUBLIC_ENABLE_DOKU` | No | Enable DOKU Payment Gateway | `true` |
| `DOKU_CLIENT_ID` | No | DOKU Jokul Client ID | Optional |
| `DOKU_SECRET_KEY` | No | DOKU Jokul Secret Key | Optional |
| `DOKU_IS_PRODUCTION` | No | Set DOKU to production mode | `false` |
| `NEXT_PUBLIC_ENABLE_STRIPE` | No | Enable Stripe Payment Gateway | `false` |
| `STRIPE_SECRET_KEY` | No | Stripe Secret Key | Optional |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe Webhook Signing Secret | Optional |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe Publishable Key | Optional |
| `RESEND_API_KEY` | No | Resend API key for transactional mail | Optional |
| `R2_ENDPOINT` | No | Cloudflare R2 / S3 API endpoint | Optional |
| `R2_BUCKET_NAME` | No | R2 Bucket Name | Optional |
| `R2_ACCESS_KEY_ID` | No | R2 Access Key ID | Optional |
| `R2_SECRET_ACCESS_KEY` | No | R2 Secret Access Key | Optional |
| `R2_PUBLIC_URL` | No | Public CDN URL for uploaded media | Optional |

---

## 🗄️ Database Management

Ajar uses [Drizzle ORM](https://orm.drizzle.team/) for migrations, relations, and schema enforcement:

| Command | Description |
|---|---|
| `npm run db:push` | Directly apply schema changes in `src/lib/db/schema.ts` to the database |
| `npm run db:generate` | Generate SQL migration files in `./drizzle` folder |
| `npm run db:migrate` | Run pending migrations against the database |
| `npm run db:studio` | Open interactive Drizzle Studio database browser at `https://local.drizzle.studio` |
| `npm run db:seed` | Seed demo data (courses, instructor, lessons, and quizzes) |

---

## 🔍 Core Modules Deep Dive

### 1. 🌐 Internationalization (i18n) & `tDb` Helper
- **Static Text**: Translated through `src/i18n/messages/id.json` and `src/i18n/messages/en.json` using `getTranslations(namespace)` or `useTranslations(namespace)`.
- **Dynamic Database Content**: Models store localized text using JSONB or dedicated columns (`title`, `titleId`, `description`, `descriptionId`).
- Use the `tDb(field, locale)` helper (`src/lib/i18n/db-helper.ts`) to automatically resolve the right language fallback seamlessly.

### 2. 💳 Payment Flow & Webhooks
- **Initiation**: `src/actions/payment.ts:startCheckout()` constructs a payment session with DOKU Jokul or Stripe.
- **Webhook Handlers**:
  - DOKU: `/api/webhooks/doku` verifies signature using `DOKU_SECRET_KEY` and creates an automatic `enrollment` on `SUCCESS`.
  - Stripe: `/api/webhooks/stripe` handles `checkout.session.completed` events.

### 3. 📜 Dynamic PDF Certificate Generation
- **Template**: Built using `@react-pdf/renderer` in `src/lib/pdf/certificate.tsx`.
- **Landscape Layout**: Includes course details, student name, digital signature, completion date, and a QR code linking to verification.
- **Verification Page**: Anyone can scan the QR code to view and verify the certificate at `/[locale]/v/[certificateId]`.

### 4. 🎮 XP & Gamification
- Points are awarded for completing lessons, passing quizzes, and finishing entire courses.
- Badges unlock automatically based on milestones (First Step, On Fire, Scholar, Course Master, XP Hunter, Diamond).
- The live leaderboard (`/[locale]/leaderboard`) ranks students by total earned XP.

---

## 📦 Production Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project in [Vercel Dashboard](https://vercel.com).
3. Set the environment variables listed in `.env.example`.
4. Deploy! Next.js 15 App Router and API routes will configure automatically.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are always welcome!
Please check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 📄 License & Author

Created and maintained by **Riki Muhammad** ([@r-iki](https://github.com/r-iki) • [rikode.com](https://rikode.com) • [ajar.rikode.com](https://ajar.rikode.com)).

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.
