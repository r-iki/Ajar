import { db } from "../src/lib/db";
import { certificates } from "../src/lib/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
  console.log("Fetching all certificates...");
  const allCerts = await db.query.certificates.findMany({
    orderBy: (c, { asc }) => [asc(c.issuedAt)],
  });

  console.log(`Total certificates in database: ${allCerts.length}`);

  const seen = new Set<string>();
  const idsToDelete: string[] = [];

  for (const cert of allCerts) {
    const key = `${cert.userId}:${cert.courseId}`;
    if (seen.has(key)) {
      idsToDelete.push(cert.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${idsToDelete.length} duplicate certificates to delete.`);

  if (idsToDelete.length > 0) {
    // Delete in chunks of 50
    for (let i = 0; i < idsToDelete.length; i += 50) {
      const chunk = idsToDelete.slice(i, i + 50);
      await db.delete(certificates).where(inArray(certificates.id, chunk));
    }
    console.log("Successfully deleted duplicate certificates!");
  }

  const remaining = await db.query.certificates.findMany();
  console.log(`Remaining unique certificates: ${remaining.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
