import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Scale, CreditCard, Award, AlertCircle, RefreshCw, BookOpen } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: `${t("termsTitle")} | Ajar`,
    description: t("termsSubtitle"),
  };
}

export default async function TermsAndConditionsPage() {
  const t = await getTranslations("legal");
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Ajar LMS";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-20 pt-6">
      {/* Header */}
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
          <Scale className="size-4" />
          {brandName} Terms of Service
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("termsTitle")}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground font-medium sm:text-lg">
          {t("termsSubtitle")}
        </p>
        <p className="text-xs text-muted-foreground">
          Terakhir Diperbarui: 13 Agustus 2026 • Versi 1.1
        </p>
      </header>

      {/* Highlights Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Akses Seumur Hidup</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Siswa yang telah membeli kursus berhak mendapatkan akses penuh ke materi pembelajaran tanpa batas waktu.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CreditCard className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Metode DOKU</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pembayaran didukung oleh DOKU (QRIS, VA Bank BCA/Mandiri/BRI/BNI, E-Wallet, dan Kartu Kredit/Debit).
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Award className="size-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">Sertifikat Asli</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sertifikat digital diterbitkan secara otomatis setelah menyelesaikan seluruh modul dan kelulusan kuis.
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 rounded-[2.5rem] border bg-card p-8 md:p-12 shadow-xl">
        <section className="space-y-3">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Scale className="size-5 text-primary" />
            1. Ketentuan Umum Usaha
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Selamat datang di platform pembelajaran digital <strong>{brandName}</strong>. Dengan mendaftar, mengakses, atau membeli kursus di website ini, Anda secara otomatis menyetujui dan terikat oleh seluruh Syarat dan Ketentuan yang berlaku di bawah ini.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            2. Pendaftaran Akun & Penggunaan Layanan
          </h2>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Pengguna wajib memberikan informasi data pribadi yang benar dan akurat saat melakukan registrasi.</li>
            <li>Pengguna bertanggung jawab penuh atas kerahasiaan akun dan kata sandi masing-masing.</li>
            <li>Akun bersifat pribadi dan <strong>TIDAK DIPERBOLEHKAN</strong> untuk dipindahtangankan, dijual, atau dipakai bersama oleh pihak lain (*account sharing*).</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            3. Ketentuan Pembayaran & Transaksi DOKU
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seluruh transaksi kursus berbayar dilakukan secara transparan melalui payment gateway berlisensi <strong>DOKU Payment Gateway</strong>:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Mata uang transaksi resmi adalah **Rupiah (IDR)**.</li>
            <li>Metode pembayaran yang tersedia meliputi: Instant QRIS (GoPay, OVO, ShopeePay, DANA, LinkAja), Virtual Account Bank (BCA, Mandiri, BRI, BNI, Permata, dll), serta Kartu Kredit / Debit berlogo Visa/Mastercard.</li>
            <li>Akses ke materi kursus akan diaktifkan secara otomatis seketika sistem DOKU mengonfirmasi pembayaran lunas (*Paid status*).</li>
            <li>Pesanan yang belum dibayar dalam batas waktu transaksi DOKU akan otomatis dibatalkan oleh sistem (*Expired*).</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <RefreshCw className="size-5 text-primary" />
            4. Kebijakan Pengembalian Dana (Refund Policy)
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kami mengutamakan kepuasan pengguna dalam belajar. Kebijakan pengembalian dana (*refund*) diatur sebagai berikut:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Permohonan refund dapat diajukan maksimal <strong>7 hari</strong> setelah tanggal transaksi pembelian kursus.</li>
            <li>Refund hanya berlaku apabila pengguna belum menyelesaikan lebih dari 20% dari total modul kursus yang dibeli.</li>
            <li>Proses refund akan diproses kembali ke rekening atau e-wallet asal pengguna melalui DOKU Payment Gateway setelah disetujui tim keuangan kami.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <AlertCircle className="size-5 text-primary" />
            5. Hak Kekayaan Intelektual (HKI)
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seluruh isi materi pembelajaran, video tutorial, silabus, kode sumber latihan, soal kuis, serta materi presentasi di platform {brandName} adalah hak cipta milik <strong>{brandName}</strong> dan para instrukturnya.
            Dilarang keras menggandakan, merekam, mengunggah ulang, atau mendistribusikan ulang materi tanpa izin tertulis dari manajemen.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-dashed">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Award className="size-5 text-primary" />
            6. Kontak Pengaduan & Layanan Pelanggan
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Apabila Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi tim kami melalui:
          </p>
          <div className="rounded-2xl bg-muted/50 p-6 text-sm space-y-2 font-medium">
            <p><strong>Nama Usaha:</strong> {brandName}</p>
            <p><strong>Email Operasional:</strong> <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a></p>
            <p><strong>Layanan Pelanggan:</strong> <a href="/contact" className="text-primary hover:underline">Halaman Contact Us</a></p>
          </div>
        </section>
      </article>
    </div>
  );
}
