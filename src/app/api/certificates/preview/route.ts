import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";

import { CertificateDocument } from "@/lib/pdf/certificate";

export async function GET() {
  const document = createElement(CertificateDocument, {
    userName: "Ajar Student",
    courseTitle: "Belajar Fundamental JavaScript",
    certificateCode: "AJR-DEMO-001",
    issuedAt: new Date().toISOString(),
  });

  const instance = pdf(document as never);

  const pdfBlob = await instance.toBlob();

  return new NextResponse(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=certificate-preview.pdf",
    },
  });
}
