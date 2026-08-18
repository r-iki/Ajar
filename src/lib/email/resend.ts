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
export async function sendVerificationEmail(input: {
  to: string;
  url: string;
  name: string;
}) {
  const client = getClient();

  if (!client) {
    console.warn("Resend API key not found. Skipping verification email.");
    return { skipped: true };
  }

  return client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: `Verifikasi Email Anda - Ajar`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
        <h2 style="font-weight: 900; color: #0f172a; margin-bottom: 16px;">Verifikasi Email Anda</h2>
        <p style="color: #475569; line-height: 1.6;">Halo ${input.name},</p>
        <p style="color: #475569; line-height: 1.6;">Terima kasih telah bergabung dengan Ajar. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda sepenuhnya.</p>
        <div style="margin: 32px 0;">
          <a href="${input.url}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Verifikasi Email</a>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Jika Anda tidak merasa mendaftar di Ajar, silakan abaikan email ini.</p>
      </div>
    `,
  });
}
