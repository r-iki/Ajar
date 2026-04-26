import { Resend } from "resend";

import { env } from "@/lib/env";

function getClient() {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(env.RESEND_API_KEY);
}

export async function sendEnrollmentEmail(input: {
  to: string;
  courseTitle: string;
}) {
  const client = getClient();

  if (!client) {
    return { skipped: true };
  }

  return client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: `Enrollment berhasil: ${input.courseTitle}`,
    html: `<p>Kamu berhasil enroll di kursus <strong>${input.courseTitle}</strong>.</p>`,
  });
}

export async function sendCertificateEmail(input: {
  to: string;
  courseTitle: string;
  certificateCode: string;
}) {
  const client = getClient();

  if (!client) {
    return { skipped: true };
  }

  return client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: `Sertifikat tersedia: ${input.courseTitle}`,
    html: `<p>Sertifikat kamu sudah siap. Kode verifikasi: <strong>${input.certificateCode}</strong>.</p>`,
  });
}
