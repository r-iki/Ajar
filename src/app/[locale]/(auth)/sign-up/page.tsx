"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
 
    const { data, error } = await authClient.signUp.email({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });
 
    setLoading(false);
 
    if (error) {
      toast.error(error.message || "Gagal membuat akun.");
      return;
    }
 
    if (data) {
      toast.success("Akun berhasil dibuat! Silakan masuk.");
      router.push("/sign-in");
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
        <p className="text-sm text-muted-foreground">Mulai petualangan belajar Anda di Ajar.</p>
      </header>

      <form className="space-y-3" onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white transition-opacity disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun? <Link href="/sign-in" className="underline">Sign in</Link>
      </p>
    </section>
  );
}
