import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgres://postgres:postgres@localhost:5432/ajar_dev?sslmode=disable"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(1)
    .default("dev-only-secret-change-this-32-chars-min"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  DOKU_CLIENT_ID: z.string().optional(),
  DOKU_SECRET_KEY: z.string().optional(),
  DOKU_IS_PRODUCTION: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  NEXT_PUBLIC_ENABLE_DOKU: z
    .string()
    .default("true")
    .transform((value) => value === "true"),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("Ajar Support <no-reply@ajar.local>"),
  RESEND_TO_EMAIL: z.string().default("support@ajar.local"),
  CF_WORKER_URL: z.string().optional(),
  NEXT_PUBLIC_CF_WORKER_URL: z.string().optional(),
  NEXT_PUBLIC_ENABLE_STRIPE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),

  R2_ENDPOINT: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
  COOKIE_DOMAIN: z.string().optional(),
  TRUSTED_ORIGINS: z
    .string()
    .optional()
    .default("")
    .transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),
  ALLOWED_DEV_ORIGINS: z
    .string()
    .optional()
    .default("")
    .transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),

  // Brand, Signer & Contact Configuration
  NEXT_PUBLIC_BRAND_NAME: z.string().default("Ajar LMS"),
  NEXT_PUBLIC_SIGNER_NAME: z.string().default("Lead Instructor"),
  NEXT_PUBLIC_SIGNER_TITLE: z.string().default("CEO & Founder"),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().default("support@ajar.local"),
  NEXT_PUBLIC_SUPPORT_PHONE: z.string().default("+62 800-0000-0000"),
  NEXT_PUBLIC_COMPANY_ADDRESS: z.string().default("Bandung, Indonesia"),
});

export const env = envSchema.parse(process.env);
