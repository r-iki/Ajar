"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Mail } from "lucide-react";

export function VerificationResendButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.href,
      });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleResend}
      disabled={loading || sent}
      className="flex items-center gap-2 rounded-xl bg-amber-200/50 dark:bg-amber-900/50 px-4 py-2 text-xs font-black text-amber-900 dark:text-amber-200 transition-all hover:bg-amber-200 dark:hover:bg-amber-900 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : sent ? (
        "Email Terkirim!"
      ) : (
        <>
          <Mail className="size-4" />
          Kirim Ulang Link
        </>
      )}
    </button>
  );
}
