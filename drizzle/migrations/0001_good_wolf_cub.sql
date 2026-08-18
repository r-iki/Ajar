CREATE TYPE "public"."enrollment_type" AS ENUM('public', 'manual');--> statement-breakpoint
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_code_unique";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "gateway" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_gateway";--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('midtrans');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "gateway" SET DATA TYPE "public"."payment_gateway" USING "gateway"::"public"."payment_gateway";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "enrollment_type" "enrollment_type" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "snap_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "biography" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "availability_status" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_github" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_linkedin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_twitter" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_facebook" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");