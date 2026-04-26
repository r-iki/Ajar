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
      const next = searchParams.get("next") ?? defaultRoute;
      router.push(next as any);
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
        className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white transition-opacity disabled:opacity-50"
      >
        {loading ? "Signing In..." : "Continue"}
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
