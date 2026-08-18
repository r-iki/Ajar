---
name: Ajar LMS
description: Modern interactive learning management system with vibrant character and editorial clarity.
colors:
  primary: "#d9532c"
  primary-foreground: "#ffffff"
  background: "#ffffff"
  foreground: "#1f2428"
  card: "#ffffff"
  card-foreground: "#1f2428"
  border: "#ebeef2"
  muted: "#f4f6f8"
  muted-foreground: "#687380"
  accent: "#f4f6f8"
  accent-foreground: "#d9532c"
typography:
  display:
    fontFamily: "var(--font-geist-sans), var(--font-sans), system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "var(--font-geist-sans), var(--font-sans), system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-geist-sans), var(--font-sans), system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "var(--font-geist-sans), var(--font-sans), system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-geist-mono), var(--font-mono), monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "0.01em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "#be421f"
---

# Design System: Ajar LMS

## 1. Overview

**Creative North Star: "The Vibrant Learning Sanctuary"**

Ajar LMS menggabungkan ketegasan fungsional dari alat kerja profesional (work tool) dengan kehangatan dan semangat dari platform edukasi modern. Desain visualnya dirancang untuk menghilangkan hambatan kognitif: tata letak yang bersih, hierarki tipografi yang tegas, dan transisi antar-halaman yang mulus tanpa gangguan visual yang tidak perlu. Kami menolak secara tegas tampilan AI standar yang monoton, seperti grid dot latar belakang yang berulang secara mekanis, gradient text tanpa makna, atau kartu bersarang yang membuat antarmuka terasa sesak.

Dalam ekosistem Ajar, ruang kosong (whitespace) adalah elemen arsitektur utama. Warna digunakan sebagai penanda aksi dan fokus, bukan sekadar dekorasi. Setiap elemen interaktif merespons dengan cepat dan halus, memberikan rasa percaya diri kepada siswa saat belajar dan kepada instruktur saat mengelola studio.

**Key Characteristics:**
- **Clarity-First Typography**: Kontras tinggi pada teks dengan rasio minimal 4.5:1 untuk body text dan lebar baris yang nyaman dibaca (65–75ch).
- **Identity-Driven Accent**: Aksen warna coral/burnt-orange yang hangat dan berkarakter, terinspirasi langsung dari identitas visual Ajar.
- **Flat-to-Lifted Hierarchy**: Permukaan UI bersih dan datar saat diam, dan mengangkat secara halus saat diinteraksi (hover/focus).
- **Ponytail Efficiency**: Implementasi CSS dan komponen yang ringan, bersih dari bloatware atau aturan dekoratif yang kompleks.

## 2. Colors

Palet warna Ajar didorong oleh kontras yang jernih dengan latar belakang putih murni di light mode dan slate kelam di dark mode, membiarkan warna utama coral hangat menjadi pusat perhatian interaksi.

### Primary
- **Burnt Coral** (#d9532c / oklch(0.62 0.21 43.2)): Warna identitas utama Ajar. Digunakan untuk tombol panggilan bertindak (CTA), penanda progres belajar, tab aktif, dan status penting. Wajib dipasangkan dengan teks putih murni agar kontras tetap tajam.

### Neutral
- **Pure White** (#ffffff / oklch(1 0 0)): Latar belakang utama pada light mode untuk menjaga kebersihan visual dan keterbacaan materi pembelajaran.
- **Deep Slate** (#121619 / oklch(0.145 0 0)): Latar belakang utama pada dark mode dan warna teks utama (ink) pada light mode.
- **Subtle Surface** (#f4f6f8 / oklch(0.97 0 0)): Latar belakang komponen sekunder, kartu materi, dan panel kontrol.
- **Subtle Border** (#ebeef2 / oklch(0.922 0 0)): Garis pembatas antarelemen yang tipis dan tidak mendominasi.

### Named Rules
**The White-Text-on-Saturated Rule.** Untuk setiap elemen dengan latar belakang warna utama bernuansa penuh (seperti tombol primary atau badge aktif), teks di dalamnya WAJIB berwarna putih murni (`#ffffff`), bukan hitam atau abu-abu gelap.

**The Pure-Background Rule.** Latar belakang halaman utama adalah putih murni (`oklch(1 0 0)`) atau slate pekat, bukan warna cream/sand atau kuning pudar bergaya AI standar. Kehangatan brand dibawa oleh elemen warna primary dan tipografi.

## 3. Typography

**Display Font:** Geist Sans (with system-ui, sans-serif fallback)
**Body Font:** Geist Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** Modern, clean, dan profesional dengan proporsi geometris yang tajam, sangat mudah dibaca pada layar resolusi tinggi maupun perangkat seluler.

### Hierarchy
- **Display** (Bold 700, clamp(2rem, 5vw, 3.5rem), line-height 1.15, letter-spacing -0.03em): Digunakan untuk judul utama hero section dan judul halaman utama.
- **Headline** (SemiBold 600, clamp(1.5rem, 3vw, 2.25rem), line-height 1.25, letter-spacing -0.02em): Digunakan untuk judul bab pembelajaran, nama kursus di halaman detail, dan header studio.
- **Title** (SemiBold 600, 1.25rem, line-height 1.4): Digunakan untuk judul kartu kursus dan header widget dashboard.
- **Body** (Regular 400, 1rem, line-height 1.6): Digunakan untuk penjelasan materi, deskripsi modul, dan teks artikel (panjang baris dibatasi 65–75ch).
- **Label** (Medium 500, 0.875rem, letter-spacing 0.01em): Digunakan untuk metadata kursus (durasi, jumlah modul), badge status, dan teks tombol.

### Named Rules
**The Heading Tracking Rule.** Judul ukuran besar (Display dan Headline) memiliki letter-spacing antara `-0.02em` hingga `-0.03em` agar terlihat padat dan terdesain, namun dilarang lebih ketat dari `-0.04em` agar huruf tidak saling bersentuhan.

## 4. Elevation

Ajar menggunakan filosofi **Flat-by-Default**. Kartu dan panel berada dalam posisi datar pada kondisi diam (menggunakan border tipis dari sistem neutral), dan hanya menampilkan bayangan (shadow) atau efek angkat saat pengguna mengarahkan kursor (hover) atau fokus.

### Shadow Vocabulary
- **subtle-hover** (`box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)`): Digunakan untuk kartu kursus saat di-hover dan panel dropdown.
- **modal-elevation** (`box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 1px 1px rgba(0, 0, 0, 0.05)`): Digunakan untuk modal dialog, popover navigasi, dan menu studio interaktif.

### Named Rules
**The Single-Accent Elevation Rule.** Dilarang menggabungkan border tebal berlapis dengan bayangan tebal sekaligus pada satu kartu. Pilih salah satu: border bersih atau bayangan halus.

## 5. Components

### Buttons
- **Shape:** Sudut membulat proporsional (`0.625rem` / 10px untuk tombol standar; `9999px` / pill untuk tag dan filter). Dilarang menggunakan radius >16px untuk kartu rectangular biasa.
- **Primary:** Latar belakang `Burnt Coral` (`#d9532c`), teks putih murni (`#ffffff`), padding vertikal `0.625rem` dan horizontal `1.25rem`.
- **Hover / Focus:** Transisi warna latar belakang ke `#be421f` dengan durasi 200ms exponential ease-out dan elevasi ringan `subtle-hover`.

### Cards / Containers
- **Corner Style:** Radius membulat sedang (`0.625rem` / 10px hingga `1rem` / 16px).
- **Background:** Putih murni pada light mode dengan border tipis `oklch(0.922 0 0)`. Pada dark mode, latar belakang kartu menggunakan `oklch(0.205 0 0)` dengan border `oklch(1 0 0 / 10%)`.
- **Shadow Strategy:** Datar saat diam, beralih ke `subtle-hover` saat kursor berada di atasnya (khusus kartu interaktif/bisa diklik).
- **Internal Padding:** Konsisten pada skala `1.25rem` (20px) hingga `1.5rem` (24px).

### Inputs / Fields
- **Style:** Border tipis `oklch(0.922 0 0)`, latar belakang transparan atau `oklch(1 0 0 / 5%)`, radius `0.5rem` (8px).
- **Focus:** Border berubah menjadi warna `Burnt Coral` disertai ring focus tipis (`oklch(0.62 0.21 43.2 / 20%)`) yang halus tanpa pergeseran tata letak.

### Navigation
- **Style:** Clean header/sidebar dengan navigasi bertumpuk pada font Medium 500. Tab aktif ditandai dengan perubahan warna teks dan indikator garis bawah atau pill dengan warna primary.

## 6. Do's and Don'ts

### Do:
- **Do** gunakan warna `Burnt Coral` (`#d9532c`) sebagai titik aksen utama untuk penanda interaksi, tombol panggilan bertindak, dan status penting.
- **Do** pastikan teks pada tombol primary selalu berwarna putih murni untuk keterbacaan maksimal (sesuai *The White-Text-on-Saturated Rule*).
- **Do** berikan ruang kosong (whitespace) yang lega antar bagian (32px hingga 64px) untuk menjaga irama tata letak yang santai namun fokus.
- **Do** terapkan transisi halus (`transition-all duration-200 ease-out`) pada kartu interaktif dan tombol.

### Don't:
- **Don't** gunakan latar belakang grid dekoratif monoton seperti `.hero-grid-bg` (kombinasi radial-gradient dot hitam/putih berulang) yang merupakan ciri khas template standar AI.
- **Don't** gunakan gradient text pada judul atau teks elemen antarmuka standar.
- **Don't** buat kartu di dalam kartu (over-nested cards) yang berlebihan karena akan menambah beban kognitif siswa saat membaca modul.
- **Don't** gunakan font warna abu-abu redup pada latar belakang putih atau berwarna; selalu pastikan rasio kontras teks minimal 4.5:1 terhadap latar belakangnya.
- **Don't** gunakan border-radius raksasa (>24px) pada kotak atau kartu standar.
