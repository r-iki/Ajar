import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { ShieldCheck, Lock, Eye, FileText, Database, Bell } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: `${t("privacyTitle")} | Ajar`,
    description: t("privacySubtitle"),
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("legal");
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar LMS";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-20 pt-6">
      {/* Header */}
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
          <ShieldCheck className="size-4" />
          {brandName} Legal & Compliance
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("privacyTitle")}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground font-medium sm:text-lg">
          {t("privacySubtitle")}
        </p>
        <p className="text-xs text-muted-foreground">
          Terakhir Diperbarui: 13 Agustus 2026 • Versi 1.1
        </p>
      </header>

      {/* Highlights Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Enkripsi Data</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data pengguna dan informasi akun dilindungi dengan enkripsi standar industri SSL/TLS.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Eye className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Keamanan Transaksi</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pembayaran diproses secara langsung melalui payment gateway resmi DOKU tanpa menyimpan detail kartu/PIN di server kami.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <FileText className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Privasi Pengguna</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kami tidak memperjualbelikan atau mendistribusikan data pribadi Anda ke pihak ketiga manapun.
          </p>
        </div>
      </div>

      {/* Main Legal Document Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 rounded-[2.5rem] border bg-card p-8 md:p-12 shadow-xl">
        <section className="space-y-3">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Database className="size-5 text-primary" />
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Untuk memberikan layanan pembelajaran digital yang maksimal di platform <strong>{brandName}</strong>, kami mengumpulkan beberapa jenis informasi berikut:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li><strong>Informasi Pendaftaran:</strong> Nama lengkap, alamat email, foto profil, dan kata sandi terenkripsi saat Anda membuat akun.</li>
            <li><strong>Data Transaksi Pembayaran:</strong> Riwayat pembelian kursus, metode pembayaran yang digunakan, ID transaksi DOKU, dan status pembayaran.</li>
            <li><strong>Aktivitas Pembelajaran:</strong> Progres modul, skor kuis, riwayat XP, serta sertifikat kompetensi yang diterbitkan.</li>
            <li><strong>Data Teknis:</strong> Alamat IP, tipe peramban web (browser), dan log akses untuk kepentingan keamanan dan audit sistem.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            2. Penggunaan Informasi
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Informasi yang dikumpulkan digunakan secara khusus untuk:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Menyediakan akses ke materi pembelajaran, video, artikel, dan fitur ujian kuis.</li>
            <li>Memproses pembayaran transaksi pembelian kursus secara aman melalui gateway resmi <strong>DOKU Payment Gateway</strong>.</li>
            <li>Menerbitkan Sertifikat Kelulusan resmi atas nama siswa yang terverifikasi.</li>
            <li>Mengirimkan notifikasi aktivitas pembelajaran, kuitansi transaksi, dan pembaruan materi kursus.</li>
            <li>Meningkatkan kualitas antarmuka, keamanan platform, dan performa server {brandName}.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            3. Perlindungan & Keamanan Data Pembayaran
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seluruh transaksi finansial di platform {brandName} ditangani oleh mitra payment gateway berlisensi <strong>DOKU Payment Gateway</strong>.
            Kami <strong>TIDAK PERNAH</strong> menyimpan data rahasia perbankan seperti nomor kartu kredit 16-digit, kode CVV, atau PIN Virtual Account di server kami. Semua lalu lintas data pembayaran dienkripsi secara penuh dengan protokol HTTPS / TLS 1.3.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            4. Hak Pengguna & Hak Akses Data
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Setiap pengguna {brandName} berhak untuk:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Mengakses, memperbarui, atau mengedit data profil pribadi melalui menu Pengaturan Akun.</li>
            <li>Meminta penghapusan akun atau penutupan profil secara permanen dengan menghubungi tim dukungan kami.</li>
            <li>Mengatur preferensi penerimaan notifikasi email.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            5. Kontak Legal & Pertanyaan Privasi
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jika Anda memiliki pertanyaan, kendala, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi tim legal & support kami melalui:
          </p>
          <div className="rounded-2xl bg-muted/50 p-6 text-sm space-y-2 font-medium">
            <p><strong>Entitas Usaha:</strong> {brandName}</p>
            <p><strong>Email Dukungan:</strong> <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a></p>
            <p><strong>Layanan Pengaduan:</strong> Halaman <a href="/contact" className="text-primary hover:underline">Hubungi Kami</a></p>
          </div>
        </section>
      </article>
    </div>
  );
}
