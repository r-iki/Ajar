import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🚀 Starting database migration to JSONB N-language format...");

  try {
    // 1. Categories
    console.log("Migrating categories...");
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_new JSONB`;
    await sql`UPDATE categories SET name_new = jsonb_build_object('en', COALESCE(name_en, name), 'id', COALESCE(name_id, name)) WHERE name_new IS NULL AND (name_en IS NOT NULL OR name_id IS NOT NULL OR name IS NOT NULL)`;
    await sql`ALTER TABLE categories DROP COLUMN IF EXISTS name_en, DROP COLUMN IF EXISTS name_id, DROP COLUMN IF EXISTS name`;
    await sql`ALTER TABLE categories RENAME COLUMN name_new TO name`;

    // 2. Courses
    console.log("Migrating courses...");
    await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS title_new JSONB, ADD COLUMN IF NOT EXISTS desc_new JSONB`;
    await sql`UPDATE courses SET 
      title_new = jsonb_build_object('en', COALESCE(title_en, 'Untitled'), 'id', COALESCE(title_id, 'Tanpa Judul')),
      desc_new = jsonb_build_object('en', COALESCE(desc_en, ''), 'id', COALESCE(desc_id, ''))
      WHERE title_new IS NULL`;
    await sql`ALTER TABLE courses DROP COLUMN IF EXISTS title_en, DROP COLUMN IF EXISTS title_id, DROP COLUMN IF EXISTS desc_en, DROP COLUMN IF EXISTS desc_id`;
    await sql`ALTER TABLE courses RENAME COLUMN title_new TO title`;
    await sql`ALTER TABLE courses RENAME COLUMN desc_new TO description`;

    // 3. Modules
    console.log("Migrating modules...");
    await sql`ALTER TABLE modules ADD COLUMN IF NOT EXISTS title_new JSONB`;
    await sql`UPDATE modules SET title_new = jsonb_build_object('en', COALESCE(title_en, 'Module'), 'id', COALESCE(title_id, 'Modul')) WHERE title_new IS NULL`;
    await sql`ALTER TABLE modules DROP COLUMN IF EXISTS title_en, DROP COLUMN IF EXISTS title_id`;
    await sql`ALTER TABLE modules RENAME COLUMN title_new TO title`;

    // 4. Lessons
    console.log("Migrating lessons...");
    await sql`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS title_new JSONB, ADD COLUMN IF NOT EXISTS content_new JSONB`;
    await sql`UPDATE lessons SET 
      title_new = jsonb_build_object('en', COALESCE(title_en, 'Lesson'), 'id', COALESCE(title_id, 'Materi')),
      content_new = jsonb_build_object('en', COALESCE(content_en, ''), 'id', COALESCE(content_id, ''))
      WHERE title_new IS NULL`;
    await sql`ALTER TABLE lessons DROP COLUMN IF EXISTS title_en, DROP COLUMN IF EXISTS title_id, DROP COLUMN IF EXISTS content_en, DROP COLUMN IF EXISTS content_id`;
    await sql`ALTER TABLE lessons RENAME COLUMN title_new TO title`;
    await sql`ALTER TABLE lessons RENAME COLUMN content_new TO content`;

    // 5. Quiz Questions
    console.log("Migrating quiz_questions...");
    await sql`ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_new JSONB`;
    await sql`UPDATE quiz_questions SET question_new = jsonb_build_object('en', COALESCE(question_en, 'Question'), 'id', COALESCE(question_id, 'Pertanyaan')) WHERE question_new IS NULL`;
    await sql`ALTER TABLE quiz_questions DROP COLUMN IF EXISTS question_en, DROP COLUMN IF EXISTS question_id`;
    await sql`ALTER TABLE quiz_questions RENAME COLUMN question_new TO question`;

    // 6. Quiz Choices
    console.log("Migrating quiz_choices...");
    await sql`ALTER TABLE quiz_choices ADD COLUMN IF NOT EXISTS text_new JSONB`;
    await sql`UPDATE quiz_choices SET text_new = jsonb_build_object('en', COALESCE(text_en, 'Choice'), 'id', COALESCE(text_id, 'Pilihan')) WHERE text_new IS NULL`;
    await sql`ALTER TABLE quiz_choices DROP COLUMN IF EXISTS text_en, DROP COLUMN IF EXISTS text_id`;
    await sql`ALTER TABLE quiz_choices RENAME COLUMN text_new TO text`;

    // 7. Learning Paths
    console.log("Migrating learning_paths...");
    await sql`ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS title_new JSONB, ADD COLUMN IF NOT EXISTS desc_new JSONB`;
    await sql`UPDATE learning_paths SET 
      title_new = jsonb_build_object('en', COALESCE(title_en, 'Path'), 'id', COALESCE(title_id, 'Alur Belajar')),
      desc_new = jsonb_build_object('en', COALESCE(desc_en, ''), 'id', COALESCE(desc_id, ''))
      WHERE title_new IS NULL`;
    await sql`ALTER TABLE learning_paths DROP COLUMN IF EXISTS title_en, DROP COLUMN IF EXISTS title_id, DROP COLUMN IF EXISTS desc_en, DROP COLUMN IF EXISTS desc_id`;
    await sql`ALTER TABLE learning_paths RENAME COLUMN title_new TO title`;
    await sql`ALTER TABLE learning_paths RENAME COLUMN desc_new TO description`;

    console.log("✅ All tables successfully migrated to JSONB N-language format!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
