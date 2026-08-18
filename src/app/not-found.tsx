import Link from "next/link";
import Image from "next/image";
import { Home, BookOpen, Compass, Trophy, LayoutDashboard } from "lucide-react";

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Ambient Gradient Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-xl w-full mx-auto flex flex-col items-center text-center gap-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
            <Image
              src="/favicon.jpg"
              alt="Ajar Logo"
              width={56}
              height={56}
              className="rounded-2xl object-cover"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-widest shadow-inner">
            <Compass className="size-3.5 animate-spin duration-3000" />
            <span>Status 404 • Not Found</span>
          </div>
        </div>

        {/* Big Stylized 404 Hero */}
        <div className="relative select-none my-1">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 leading-none drop-shadow-md">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-blue-500/50 rounded-full blur-xs" />
        </div>

        {/* Headline & Description */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang Anda klik salah.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md pt-2">
          <Link
            href="/"
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/25"
          >
            <Home className="size-4" />
            <span>Ke Beranda</span>
          </Link>

          <Link
            href="/courses"
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-black uppercase tracking-wider hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all shadow-md"
          >
            <BookOpen className="size-4 text-blue-400" />
            <span>Lihat Kursus</span>
          </Link>
        </div>

        {/* Helpful Quick Links Card */}
        <div className="w-full pt-8 border-t border-slate-800/80">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
            Tautan Cepat
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <BookOpen className="size-3.5 text-blue-400" />
              <span>Katalog Kursus</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Trophy className="size-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LayoutDashboard className="size-3.5 text-emerald-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
