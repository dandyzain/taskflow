# 📋 TaskFlow — Modern Collaborative Kanban & Team Analytics

<div align="center">
  <img src="public/icon-512.png" alt="TaskFlow Logo" width="120" height="120" />
  <h3>TaskFlow — Platform Manajemen Tugas Kolaboratif & Analisis Kinerja Tim</h3>
  <p>Dibangun dengan Next.js 15 (App Router), Tailwind CSS (Aurora Calm design tokens), @dnd-kit Sortable, Prisma ORM, dan Neon Serverless PostgreSQL.</p>

  <p>
    <a href="https://taskflow-theta-five-71.vercel.app"><strong>🌐 Buka Live Demo (Vercel) »</strong></a>
  </p>
</div>

---

## 🚀 Sekilas Proyek

TaskFlow adalah aplikasi manajemen tugas Kanban enterprise-grade yang menggabungkan estetika modern bertema pastel lembut, animasi interaktif, serta modul analitik mendalam untuk memantau produktivitas dan evaluasi kinerja karyawan secara real-time.

Aplikasi ini sudah sepenuhnya **responsif** di seluruh perangkat (Mobile 320px, Tablet, hingga Desktop 4K) dan mendukung **PWA (Progressive Web App)**.

### 🔗 Live Deployment
- **Production URL:** [https://taskflow-theta-five-71.vercel.app](https://taskflow-theta-five-71.vercel.app)
- **Akun Demo Cepat:**
  - **Admin / Workspace Owner:** `demo@taskflow.dev` (Password: `password123`)
  - **Core Member (Sarah):** `sarah@taskflow.dev` (Password: `password123`)
  - **Core Member (Alex):** `alex@taskflow.dev` (Password: `password123`)

---

## ✨ Fitur Utama

### 1. 🗂️ Kanban Board Interaktif & Fluid
- **Drag & Drop Halus (@dnd-kit):** Mendukung pemindahan kolom (*horizontal sortable*) dan kartu tugas (*vertical & cross-column sortable*) secara presisi dengan algoritma *fractional indexing*.
- **Touch-Friendly & Snap Scroll:** Nyaman digeser di smartphone dengan *CSS scroll snap* dan affordance khusus layar sentuh (`hover-reveal`).
- **Pencarian & Filter Cepat:** Filter kartu secara instan berdasarkan nama, tingkat prioritas (*Urgent, High, Medium, Low*), dan label warna kustom.
- **Detail Tugas Komprehensif:** Modal interaktif untuk mengubah judul, deskripsi, tanggal jatuh tempo (*due date*), assignee anggota tim, dan checklist.

### 2. 📊 Dashboard & Reporting Kinerja Karyawan
- **KPI Summary Cards:** Menghitung total tugas, tingkat penyelesaian (*completion rate*), tugas tepat waktu (*on-time rate*), tugas *overdue*, dan rata-rata *lead time*.
- **Velocity Chart:** Visualisasi jumlah tugas yang diselesaikan per minggu atau per sprint.
- **Top Performers Podium:** Peringkat 3 besar kontributor terbaik dengan sistem medali dan rasio keberhasilan.
- **Tabel Evaluasi Anggota Tim:** Rincian beban kerja (*optimal, heavy, overloaded*), total tugas yang diemban, tugas sedang berjalan, dan riwayat aktivitas.

### 3. 🎨 Desain "Aurora Calm" & Dark Mode
- **Design tokens semantik:** permukaan netral, warna hanya untuk makna (status, prioritas, label); gradien *aurora* brand untuk fokus, progres, dan momen "selesai". Semua pasangan teks/latar lolos WCAG AA (≥ 4.5:1) di mode terang & gelap.
- **Tipografi Geist** (Sans + Mono dengan angka *tabular* untuk KPI), skala elevasi `e1–e3`, token durasi/easing animasi.
- **Animasi bermakna:** drag & drop dengan *lift* dan *spring*, konfeti saat tugas masuk kolom Done, transisi halaman, reveal saat scroll, grafik yang "menggambar" diri. Semua menghormati `prefers-reduced-motion`.
- **Brand Identity & Iconography:** logo SVG monogram "T" dari blok Kanban serta ikon multi-resolusi untuk iOS dan Android.

### 4. ⌨️ Produktivitas & UX
- **Command palette (⌘K / Ctrl+K):** lompat ke board, cari tugas, buat board/tugas, ganti tema & bahasa.
- **Quick-add:** ketik `Perbaiki login !urgent @sarah #bug` untuk langsung mengisi prioritas, assignee, dan label.
- **Panel detail tugas** (side panel di desktop, bottom sheet di ponsel) dengan indikator *Saving… / Saved*.
- **Hapus dengan Undo** (5 detik), dialog konfirmasi yang konsisten, filter & mode tampilan (Board / List) tersimpan di URL.
- **Pintasan:** `⌘K` palette · `/` cari · `N` tugas baru · `[` ciutkan sidebar · `?` bantuan · `Space` + panah untuk memindah kartu dengan keyboard.
- **Responsif penuh:** sidebar rail di tablet, tab bar bawah + column switcher di ponsel, kolom bisa diciutkan.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, React Server Components)
- **Bahasa:** TypeScript 5
- **Styling & UI:** Tailwind CSS (design tokens), Radix UI Primitives, Lucide Icons, Sonner Toast, Geist font
- **Motion & Interaksi:** [Motion](https://motion.dev) (LazyMotion), `cmdk` (command palette), `vaul` (bottom sheet), `@number-flow/react` (angka KPI), `canvas-confetti` (lazy)
- **Drag and Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Database & ORM:** PostgreSQL (Neon), [Prisma ORM](https://www.prisma.io/)
- **State & Optimistic UI:** React Optimistic Updates dengan rollback otomatis saat koneksi gagal
- **Hosting / Deployment:** Vercel (juga mendukung Docker / Railway)

---

## 🧩 Struktur UI

```
components/
  ui/         primitives (shadcn/Radix): button, dialog, sheet, drawer, dropdown-menu, tabs, command, …
  patterns/   pola lintas fitur: PriorityBadge, DueChip, AvatarStack, EmptyState, ConfirmDialog, Reveal
  layout/     app shell: sidebar/rail, command palette, mobile tab bar, account menu
  kanban/     board, kolom, kartu, card panel, list view, quick-add
  reports/    dashboard, KPI, grafik
lib/design/tokens.ts   satu sumber kebenaran untuk prioritas, status, tenggat, warna avatar
lib/motion.ts          preset durasi, easing, dan spring
```

---

## 💻 Panduan Instalasi Lokal

### 1. Prasyarat
- **Node.js:** v20.x atau v22.x (Rekomendasi: `v22.x`)
- **npm:** v10.x+
- **Git**

### 2. Clone Repository & Setup
```bash
# Clone repository dari GitLab
git clone git@gitlab.com:dandyzain.personal/taskflow.git
cd taskflow

# Install dependensi
npm install --legacy-peer-deps
```

### 3. Konfigurasi Environment & Database
Buat file `.env` di root project:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="taskflow-super-secure-secret-key-2026"
```

Inisialisasi database SQLite dan seed data demo:
```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev --name init

# Seed data contoh (pengguna demo, board, kolom, kartu, label)
npx prisma db seed
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di **http://localhost:3000**.

---

## 📖 Panduan Lengkap Pengguna

Dokumentasi lengkap panduan penggunaan, manual book pengujian, panduan peran (Role Guide), serta tips pemecahan masalah dapat dibaca di:
👉 **[USER_GUIDE.md](./USER_GUIDE.md)**

---

## 👥 Kontributor
- **Dandy Rahmat Zain** ([dandyzain.personal@gmail.com](mailto:dandyzain.personal@gmail.com))
