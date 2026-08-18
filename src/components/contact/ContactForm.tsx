"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendContactForm } from "@/actions/contact";

export function ContactForm() {
  const t = useTranslations("legal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setIsSuccess(false);

    try {
      const res = await sendContactForm({
        name,
        email,
        subject,
        message,
      });

      if (res.success) {
        setIsSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setErrorMsg(res.error || "Gagal mengirim pesan.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan teknis. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2.5rem] border bg-card p-8 md:p-10 shadow-xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight">{t("contactFormTitle")}</h2>
        <p className="text-xs text-muted-foreground font-medium">
          {t("contactFormDesc")}
        </p>
      </div>

      {isSuccess && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-start gap-3.5 animate-in fade-in duration-300">
          <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {t("sendSuccess")}
            </p>
            <p className="text-xs text-muted-foreground">
              Terima kasih telah menghubungi kami. Kami akan merespon pesan Anda secepatnya.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="size-5 text-destructive shrink-0" />
          <p className="text-xs font-bold text-destructive">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("name")} *
            </label>
            <input
              type="text"
              id="fullName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap Anda..."
              className="w-full rounded-2xl border bg-background px-4 py-3.5 text-sm font-medium transition-colors focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("email")} *
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com..."
              className="w-full rounded-2xl border bg-background px-4 py-3.5 text-sm font-medium transition-colors focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("subject")} *
          </label>
          <input
            type="text"
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Pertanyaan seputar pembayaran, kursus, atau kendala..."
            className="w-full rounded-2xl border bg-background px-4 py-3.5 text-sm font-medium transition-colors focus:border-primary focus:outline-hidden"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("message")} *
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tuliskan pesan Anda secara detail..."
            className="w-full rounded-2xl border bg-background px-4 py-3.5 text-sm font-medium transition-colors focus:border-primary focus:outline-hidden resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            <>
              <Send className="size-4" />
              {t("sendMessage")}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
