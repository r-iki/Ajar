import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { certificates, courses, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CertificateDocument } from "@/lib/pdf/certificate";
import path from "path";
import fs from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Require authentication
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch certificate with relations
  const cert = await db.query.certificates.findFirst({
    where: eq(certificates.id, id),
  });

  if (!cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  // Only allow the owner to download
  if (cert.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, cert.courseId),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
  });
 
  const user = await db.query.users.findFirst({
    where: eq(users.id, cert.userId),
  });
 
  const expiryDate = new Date(cert.issuedAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);

  // Read images from filesystem
  let logoData = null;
  let ttdData = null;
  try {
    const publicDir = path.join(process.cwd(), "public");
    logoData = fs.readFileSync(path.join(publicDir, "favicon.jpg"));
    ttdData = fs.readFileSync(path.join(publicDir, "TTD.png"));
  } catch (e) {
    console.error("Error reading images for certificate:", e);
  }

  const document = createElement(CertificateDocument, {
    userName: user?.name ?? session.user.name,
    courseTitle: course?.titleId ?? "Kursus",
    certificateCode: cert.code,
    issuedAt: cert.issuedAt.toISOString(),
    certId: cert.id,
    modules: course?.modules ?? [],
    expiryDate: expiryDate.toISOString(),
    logoData,
    ttdData,
  });

  const instance = pdf(document as never);
  const pdfBuffer = await instance.toBuffer();
 
  const safeTitle = (course?.titleId ?? "Sertifikat")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
 
  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Sertifikat-${safeTitle}.pdf"`,
    },
  });
}
