# TaskFlow 📋

TaskFlow adalah aplikasi manajemen proyek & Kanban Board modern dengan desain antarmuka pastel yang elegan, animasi interaktif, serta modul **Dashboard & Reporting Kinerja Karyawan**.

![TaskFlow Kanban Board](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)

---

## 🌟 Fitur Utama

- **🎨 Modern Pastel UI & UX**:
  - Palet warna lembut (*mint, sky, peach, lavender, rose, butter*).
  - Animasi transisi halus dan micro-interactions modern.
  - Dukungan Dark Mode dan Light Mode terintegrasi.
- **📌 Interactive Kanban Board**:
  - Drag-and-drop antar kolom dan reorder kartu menggunakan `@dnd-kit`.
  - Collision detection khusus kolom & kartu untuk pergerakan mulus tanpa error.
  - Algoritma **Fractional Indexing** untuk optimasi urutan kartu tanpa re-indexing massal.
  - Multi-Board per Workspace (misal: *Sprint Board*, *Product Roadmap*).
- **📊 Modul Dashboard & Reporting**:
  - **Task KPI Metrics**: Total tugas, persentase penyelesaian, tugas aktif, dan tugas terlambat.
  - **Visualisasi Distribusi**: Multi-segment progress bar untuk status tahapan dan urgensi prioritas.
  - **Velocity & Activity Trend**: Diagram batang SVG tren volume tugas per hari (7 hari terakhir).
  - **Employee Performance & Leaderboard**: Podium Top Performers, beban kerja (*Optimal, Light, Heavy, Overloaded*), on-time delivery rate, dan tabel evaluasi karyawan.
  - **Ekspor Data (CSV)**: Unduh laporan detail tugas dan performa tim dalam 1 klik.
- **🔐 Autentikasi & RBAC (Role-Based Access Control)**:
  - Manajemen akun dengan registrasi & login aman (JWT Cookie & bcrypt password hashing).
  - Hak akses hierarkis Workspace: `ADMIN`, `MEMBER`, `VIEWER`.
- **⚡ Optimistic UI**: Respon antarmuka instan dengan mekanisme rollback otomatis jika terjadi kegagalan jaringan.

---

## 👥 Akun Demo untuk Pengujian

Gunakan kredensial berikut untuk mencoba fitur aplikasi:

| Akun | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@taskflow.dev` | `password123` | **ADMIN** |
| **Sarah Chen** | `sarah@taskflow.dev` | `password123` | **MEMBER** |
| **Alex Kim** | `alex@taskflow.dev` | `password123` | **MEMBER** |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Server Components)
- **Frontend**: React 19, Tailwind CSS, Lucide React, Radix UI
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Database & ORM**: SQLite, Prisma ORM
- **Autentikasi**: Jose (JWT), bcryptjs
- **Validasi**: Zod

---

## 🚀 Instalasi & Menjalankan Lokal

1. **Clone Repository**:
   ```bash
   git clone git@github.com:dandyzain/taskflow.git
   cd taskflow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin berkas `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Migrasi & Seed Data**:
   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```

5. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

---

## 🚢 Panduan Deploy

### 🚄 Deploy ke Railway (Rekomendasi untuk SQLite)
Railway mendukung deployment langsung dari repository GitLab atau GitHub:

1. Buka dashboard [Railway](https://railway.com) lalu klik **New Project**.
2. Pilih **Deploy from GitHub repo** atau **Deploy from GitLab repo**, lalu pilih repository `taskflow`.
3. Tambahkan **Environment Variables** di tab *Variables*:
   - `DATABASE_URL`: `file:./dev.db` (atau path volume `/app/prisma/dev.db`)
   - `AUTH_SECRET`: Generate string acak minimal 32 karakter (misal: `openssl rand -base64 32`)
4. *(Opsional - Persistent Storage)*: Di tab *Settings* -> *Volumes*, buat volume baru dengan mount path `/app/prisma` agar data database SQLite tetap tersimpan saat restart container.
5. Railway akan mendeteksi [`railway.json`](./railway.json) atau [`Dockerfile`](./Dockerfile), menjalankan migrasi & seed otomatis, dan memberikan domain live publik gratis (`https://xxxx.up.railway.app`)!

---

### ▲ Deploy ke Vercel
1. Buka [Vercel](https://vercel.com/new) dan impor repository `taskflow`.
2. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: URL database hosted (PostgreSQL / Turso LibSQL / Supabase).
   - `AUTH_SECRET`: Kunci rahasia JWT minimal 32 karakter.
3. Build command: `npm run build` (otomatis menjalankan `prisma generate && next build`).

---

## 📄 Lisensi
MIT License © 2026 Dandy Rahmat Zain
