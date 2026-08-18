"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Gagal masuk. Periksa kembali email & password Anda.");
      return;
    }

    if (data) {
      toast.success("Selamat datang kembali!");
      
      let defaultRoute = "/dashboard";
      const user = data.user as any;
      if (user.role === "admin") {
        defaultRoute = "/overview";
      } else if (user.role === "instructor") {
        defaultRoute = "/studio/courses";
      }

      // Honour the ?next= redirect param sent by middleware, fallback to role-based route
      const rawNext = searchParams.get("next") ?? defaultRoute;
      const cleanNext = rawNext.replace(/^\/(?:id|en)(?=\/|$)/, "") || defaultRoute;
      router.push(cleanNext as any);
      router.refresh();
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSignIn}>
      <input
        id="signin-email"
        type="email"
        placeholder="Email"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        id="signin-password"
        type="password"
        placeholder="Password"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button
        id="signin-submit"
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/10"
      >
        {loading ? "Signing In..." : "Continue"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={async () => {
          await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted"
      >
        <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Google
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <section className="mx-auto w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p className="text-sm text-muted-foreground">Masuk untuk melanjutkan proses belajar Anda.</p>
      </header>

      {/* Suspense required for useSearchParams in Next.js */}
      <Suspense fallback={<div className="h-[140px] animate-pulse rounded-lg bg-muted" />}>
        <SignInForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun? <Link href="/sign-up" className="underline">Sign up</Link>
      </p>
    </section>
  );
}
