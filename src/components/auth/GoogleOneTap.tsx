"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function GoogleOneTap() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    // Jika user sudah login, batalkan/tutup popup One Tap jika masih terbuka dan jangan tampilkan
    if (session) {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id?.cancel) {
        try {
          (window as any).google.accounts.id.cancel();
        } catch (e) {
          // ignore
        }
      }
      return;
    }

    const triggerOneTap = async () => {
      try {
        await authClient.oneTap();
      } catch (error) {
        // Silent fail if one tap fails or is blocked
        console.warn("One Tap prompt failed to load:", error);
      }
    };

    triggerOneTap();
  }, [isPending, session]);

  return null;
}
