"use server";

import { Resend } from "resend";

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function sendContactForm(data: ContactFormData) {
  const { name, email, subject, message } = data;

  if (!name || !email || !message) {
    return { success: false, error: "Semua kolom bertanda * wajib diisi." };
  }

  const cfWorkerUrl = process.env.CF_WORKER_URL || process.env.NEXT_PUBLIC_CF_WORKER_URL;

  // 1. Jika URL Cloudflare Worker dikonfigurasi, kirim melalui Worker
  if (cfWorkerUrl) {
    try {
      const response = await fetch(cfWorkerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject: subject || "Pesan Baru dari Website Ajar",
          message,
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error("Cloudflare Worker error:", errorText);
        return { success: false, error: "Gagal mengirim pesan melalui server email." };
      }
    } catch (error) {
      console.error("Error calling Cloudflare Worker:", error);
      return { success: false, error: "Terjadi kesalahan jaringan saat menghubungi server email." };
    }
  }

  // 2. Fallback: Menggunakan Resend API langsung jika RESEND_API_KEY dikonfigurasi di .env
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Ajar Support <no-reply@ajar.local>";
      const toEmail = process.env.RESEND_TO_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@ajar.local";

      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: `[Ajar Contact Form] ${subject || "Pesan Baru"}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Ada Pesan Baru dari Formulir Kontak Ajar</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Nama:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subjek:</strong> ${subject || "-"}</p>
            <p><strong>Pesan:</strong></p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error sending via Resend:", error);
      return { success: false, error: error.message || "Gagal mengirim email." };
    }
  }

  // 3. Jika belum diatur di .env (Simulasi sukses untuk preview dev)
  console.log("Contact Form Submission (Simulated):", { name, email, subject, message });
  return { success: true, simulated: true };
}
