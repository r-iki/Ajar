"use server";

import { pdf } from "@react-pdf/renderer";

import { sendCertificateEmail } from "@/lib/email/resend";
import { CertificateDocument } from "@/lib/pdf/certificate";

type GenerateCertificateInput = {
  userName: string;
  userEmail: string;
  courseTitle: string;
};

export async function generateCertificate(input: GenerateCertificateInput) {
  const certificateCode = `AJR-${Date.now()}`;
  const issuedAt = new Date().toISOString();

  const document = (
    <CertificateDocument
      userName={input.userName}
      courseTitle={input.courseTitle}
      certificateCode={certificateCode}
      issuedAt={issuedAt}
      certId={certificateCode}
    />
  );

  const instance = pdf(document);
  const pdfStream = await instance.toBuffer();

  await sendCertificateEmail({
    to: input.userEmail,
    courseTitle: input.courseTitle,
    certificateCode,
  });

  return {
    certificateCode,
    issuedAt,
    hasPdfStream: Boolean(pdfStream),
  };
}
