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
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("no-reply@ajar.local"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  MIDTRANS_MERCHANT_ID: z.string().optional(),
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_ENABLE_STRIPE: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_ENABLE_MIDTRANS: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
});

export const env = envSchema.parse(process.env);
