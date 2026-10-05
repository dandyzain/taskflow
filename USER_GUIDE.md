# 📘 TaskFlow — Panduan Lengkap Pengguna (User Guide)
### Panduan Penggunaan, Panduan Pengembang & Referensi Fitur

---

## Daftar Isi

1. [Tentang TaskFlow](#1-tentang-taskflow)
2. [Akses Sistem & Akun Percobaan](#2-akses-sistem--akun-percobaan)
3. [Navigasi & Tata Letak Antarmuka (Responsif)](#3-navigasi--tata-letak-antarmuka-responsif)
4. [Manajemen Workspace & Board](#4-manajemen-workspace--board)
5. [Penggunaan Papan Kanban](#5-penggunaan-papan-kanban)
   - [5.1 Menambah & Mengelola Kolom](#51-menambah--mengelola-kolom)
   - [5.2 Menambah & Mengedit Kartu Tugas](#52-menambah--mengedit-kartu-tugas)
   - [5.3 Drag & Drop Kartu Antar Kolom](#53-drag--drop-kartu-antar-kolom)
   - [5.4 Label Warna & Tingkat Prioritas](#54-label-warna--tingkat-prioritas)
   - [5.5 Assignee & Anggota Tim](#55-assignee--anggota-tim)
   - [5.6 Pencarian & Multi-Filter](#56-pencarian--multi-filter)
6. [Dashboard & Evaluasi Kinerja Karyawan](#6-dashboard--evaluasi-kinerja-karyawan)
   - [6.1 Kartu KPI Utama](#61-kartu-kpi-utama)
   - [6.2 Velocity Chart](#62-velocity-chart)
   - [6.3 Podium Karyawan Berprestasi (Top Performers)](#63-podium-karyawan-berprestasi-top-performers)
   - [6.4 Tabel Evaluasi Beban Kerja Tim](#64-tabel-evaluasi-beban-kerja-tim)
7. [Pintasan Keyboard (Keyboard Shortcuts)](#7-pintasan-keyboard-keyboard-shortcuts)
8. [Panduan Pengembang & Instalasi Mandiri](#8-panduan-pengembang--instalasi-mandiri)
9. [Tanya Jawab & Pemecahan Masalah (FAQ & Troubleshooting)](#9-tanya-jawab--pemecahan-masalah-faq--troubleshooting)

---

## 1. Tentang TaskFlow

**TaskFlow** adalah aplikasi manajemen proyek dan tugas berbasis Kanban modern yang dirancang untuk mendukung kolaborasi tim dengan efisiensi tinggi. Memadukan estetika visual pastel lembut yang menenangkan mata, animasi interaktif yang dinamis, serta analitik kinerja karyawan yang mendalam, TaskFlow membantu perusahaan mengelola alur kerja dari perencanaan sprint hingga evaluasi hasil kerja.

### Fitur Kunci:
- **Desain Pastel Modern:** Transisi halus, sudut lembut (*rounded 2xl/3xl*), mesh gradient, serta dukungan penuh untuk **Light & Dark Mode**.
- **Performa Responsif di Semua Layar:** Beradaptasi mulus dari ponsel pintar (320px), tablet, laptop, hingga monitor desktop lebar.
- **Drag & Drop Presisi Tinggi:** Menggunakan library `@dnd-kit` dengan algoritma *fractional indexing* untuk pengurutan kartu dan kolom tanpa lag.
- **Modul Analitik & KPI:** Menghitung otomatis produktivitas, ketepatan waktu (*on-time delivery*), dan beban kerja setiap individu.

---

## 2. Akses Sistem & Akun Percobaan

Aplikasi dapat diakses secara langsung di browser tanpa instalasi tambahan melalui tautan berikut:
- **Tautan Live:** **[https://taskflow-production-41d9.up.railway.app](https://taskflow-production-41d9.up.railway.app)**

### Akun Demo Bawaan (1-Click Login):
Pada halaman masuk (*login*), Anda dapat mengklik salah satu kartu akun demo untuk langsung mengisi kredensial secara otomatis:

| Akun | Email | Kata Sandi | Peran (Role) | Hak Akses |
|---|---|---|---|---|
| **Demo User** | `demo@taskflow.dev` | `password123` | **ADMIN** | Pemilik workspace, mengelola seluruh board, kolom, kartu, dan melihat analitik. |
| **Sarah Chen** | `sarah@taskflow.dev` | `password123` | **MEMBER** | Anggota tim, mengelola kartu, mengubah status tugas, melihat laporan. |
| **Alex Kim** | `alex@taskflow.dev` | `password123` | **MEMBER** | Anggota tim teknis, menangani tugas sprint. |

> **Catatan:** Anda juga dapat mendaftarkan akun baru melalui tombol **"Create an account"** di halaman login.

---

## 3. Navigasi & Tata Letak Antarmuka (Responsif)

TaskFlow dirancang dengan layout adaptif:
- **Tampilan Desktop (Layar Lebar):**
  - Sidebar di sebelah kiri menampilkan nama Workspace, tautan cepat ke **Dashboard & Laporan**, daftar seluruh **Boards**, tombol pembuatan board baru, toggle tema (*light/dark*), dan profil pengguna aktif.
- **Tampilan Tablet & Smartphone (Layar Kecil):**
  - Terdapat bar navigasi di bagian atas dengan tombol **Menu Hamburger** (kiri).
  - Mengklik hamburger menu akan membuka sidebar dalam bentuk *slide-out drawer* (lembar geser).
  - Tersedia tombol cepat di header atas untuk langsung menuju halaman Laporan (*Reports*) dan mengganti tema warna.

---

## 4. Manajemen Workspace & Board

### Membuat Board Baru:
1. Di sidebar, cari bagian **BOARDS**.
2. Klik ikon tambah (**`+`**) di sebelah kanan judul BOARDS.
3. Masukkan **Judul Board** (contoh: *Mobile App Sprint*) dan opsional **Deskripsi**.
4. Klik **Create Board**. Halaman akan otomatis berpindah ke board baru tersebut.

### Mengubah Judul & Deskripsi Board:
- Pada halaman board, klik langsung pada teks judul atau deskripsi di bagian atas untuk mengeditnya secara inline (*instant edit*).
- Tekan tombol **Enter** atau klik di luar area input untuk menyimpan perubahan.

### Menghapus Board:
- Pada header board, klik tombol opsi (**Delete Board**).
- Konfirmasi penghapusan. Sistem akan menghapus board beserta seluruh kolom dan kartu di dalamnya secara aman.

---

## 5. Penggunaan Papan Kanban

### 5.1 Menambah & Mengelola Kolom
- **Menambah Kolom:** Geser ke bagian paling kanan papan Kanban, isi form **"+ Add Column"** dengan nama kolom (misal: *Code Review*), lalu tekan **Enter** atau klik tombol tambah.
- **Mengubah Nama Kolom:** Klik dua kali (*double click*) pada judul kolom, ketik nama baru, dan tekan **Enter**.
- **Menghapus Kolom:** Arahkan kursor ke kolom (atau tap pada layar sentuh), klik ikon **Tempat Sampah** di pojok kanan atas kolom.
- **Memindahkan Posisi Kolom:** Tahan ikon drag handle (titik enam) di samping judul kolom, lalu geser ke kiri atau ke kanan untuk mengubah urutan.

### 5.2 Menambah & Mengedit Kartu Tugas
- **Menambah Kartu:** Di bagian bawah setiap kolom, klik form **"+ Add Card"**, ketik judul tugas, lalu tekan **Enter**.
- **Melihat & Mengedit Detail Tugas:** Klik kartu mana saja untuk membuka jendela dialog detail. Di jendela ini Anda dapat:
  - Mengubah judul dan rincian deskripsi tugas.
  - Memilih tingkat prioritas (*Low, Medium, High, Urgent*).
  - Menetapkan tanggal batas waktu (*due date*).
  - Memilih label kategori (misal: *Feature, Bug, Docs, Improvement*).
  - Menugaskan anggota tim (*assignee*).

### 5.3 Drag & Drop Kartu Antar Kolom
TaskFlow telah disempurnakan agar kartu dapat dipindahkan dengan sangat presisi:
- **Dalam Satu Kolom:** Klik dan tahan kartu, geser ke atas atau ke bawah untuk mengubah urutan prioritas.
- **Lintas Kolom:** Tarik kartu ke kolom lain.
  - Jika ingin menaruh di **paling atas**, arahkan ke bagian atas kartu pertama.
  - Jika ingin menaruh di **tengah**, arahkan ke kartu perantara.
  - Jika ingin menaruh di **paling bawah**, arahkan ke bagian bawah kartu terakhir atau area kosong kolom. Sistem secara cerdas mendeteksi posisi jatuhnya kartu dan langsung menyimpannya ke database.

### 5.4 Label Warna & Tingkat Prioritas
Setiap tugas dapat ditandai dengan badge visual:
- **Prioritas:**
  - 🔴 **Urgent:** Tugas mendesak bernilai kritis.
  - 🟠 **High:** Prioritas tinggi.
  - 🟡 **Medium:** Prioritas standar.
  - 🟢 **Low:** Prioritas pendukung/opsional.
- **Label Kategori:** Membantu mengelompokkan tugas berdasarkan tipe (*Frontend, Backend, Design, Testing, DevOps*).

### 5.5 Assignee & Anggota Tim
- Pada modal detail kartu, Anda dapat memilih avatar anggota tim yang bertanggung jawab.
- Avatar anggota tim akan tampil di sudut kanan bawah kartu pada papan Kanban untuk memudahkan pemantauan delegasi tugas.

### 5.6 Pencarian & Multi-Filter
Di bagian toolbar atas board tersedia alat pencarian dinamis:
- **Kotak Pencarian:** Ketik kata kunci tugas untuk menyaring kartu secara real-time.
- **Filter Prioritas:** Pilih untuk hanya menampilkan kartu dengan tingkat urgensi tertentu.
- **Filter Label:** Saring kartu berdasarkan tag/label spesifik.
- **Tombol Reset:** Muncul otomatis ketika ada filter aktif untuk mengembalikan tampilan penuh papan.

---

## 6. Dashboard & Evaluasi Kinerja Karyawan

Akses halaman ini melalui menu **"Dashboard & Laporan"** di sidebar. Halaman ini menyediakan metrik analitik mendalam untuk mengevaluasi efektivitas tim.

### 6.1 Kartu KPI Utama
1. **Total Tugas:** Jumlah seluruh tugas yang tercatat di workspace.
2. **Tingkat Penyelesaian (Completion Rate):** Persentase tugas yang sudah selesai (*Done*) dibanding total tugas.
3. **Ketepatan Waktu (On-Time Delivery):** Persentase tugas selesai yang tidak melewati tanggal tenggat (*due date*).
4. **Tugas Terlambat (Overdue Tasks):** Jumlah tugas aktif yang telah melewati batas waktu dan memerlukan perhatian segera.
5. **Rata-Rata Lead Time:** Estimasi rata-rata waktu yang dibutuhkan tim dari pembuatan tugas hingga selesai.

### 6.2 Velocity Chart
Grafik batang interaktif yang membandingkan volume tugas yang diselesaikan antar sprint/minggu untuk mengukur konsistensi produktivitas tim.

### 6.3 Podium Karyawan Berprestasi (Top Performers)
Menampilkan 3 anggota tim dengan kontribusi tertinggi:
- 🥇 **Juara 1:** Kontributor dengan tingkat penyelesaian dan kecepatan tertinggi.
- 🥈 **Juara 2:** Kontributor aktif kedua.
- 🥉 **Juara 3:** Kontributor aktif ketiga.
Setiap kartu podium menampilkan jumlah tugas selesai, persentase keberhasilan, dan riwayat aktivitas tim.

### 6.4 Tabel Evaluasi Beban Kerja Tim
Tabel komprehensif yang merinci setiap karyawan:
- **Status Beban Kerja:** 
  - *Optimal:* Beban kerja seimbang.
  - *Beban Tinggi:* Mendekati kapasitas maksimal.
  - *Overload:* Terlalu banyak tugas aktif dan berpotensi mengalami keterlambatan.
- **Statistik Kolom:** Total task, selesai, sedang dikerjakan (*in progress*), terlambat (*overdue*), serta persentase ketepatan waktu.

---

## 7. Pintasan Keyboard (Keyboard Shortcuts)

Untuk mempercepat alur kerja pengguna desktop:

| Pintasan Keyboard | Aksi |
|---|---|
| **`/`** | Langsung fokus ke kolom pencarian tugas di toolbar. |
| **`Esc`** | Menutup modal detail kartu / membatalkan input. |
| **`Enter`** | Menyimpan perubahan input atau membuat kartu/kolom baru. |
| **`Tab`** | Berpindah ke field form berikutnya. |

---

## 8. Panduan Pengembang & Instalasi Mandiri

Bagi developer yang ingin menjalankan atau memodifikasi kode TaskFlow secara lokal di lingkungan komputer sendiri:

### 1. Struktur Direktori Utama
```
taskflow/
├── actions/                  # Server Actions (Mutasi database & logic bisnis)
├── app/                      # Next.js 15 App Router (Pages, Layout, Manifest)
│   ├── icon.svg              # Brand vector logo
│   ├── login/                # Halaman autentikasi masuk
│   ├── register/             # Halaman registrasi akun baru
│   └── workspace/[id]/       # Halaman Kanban & Laporan analitik
├── components/
│   ├── brand/logo.tsx        # Komponen logo terpusat (Logo & LogoMark)
│   ├── kanban/               # Komponen papan Kanban, kolom, kartu, toolbar
│   ├── reports/              # Komponen dashboard analitik, KPI, podium, tabel
│   ├── layout/               # Sidebar desktop & shell mobile adaptif
│   └── ui/                   # Komponen antarmuka dasar (Dialog, Sheet, Button)
├── hooks/                    # Custom React hooks (DnD, filter, shortcuts)
├── lib/                      # Utilitas database Prisma, JWT auth, RBAC
├── prisma/                   # Schema database SQLite & file seed
└── scripts/                  # Helper script (generate icon resolusi tinggi)
```

### 2. Langkah Menjalankan Aplikasi
```powershell
# 1. Pastikan Node.js v20+ atau v22+ terpasang
node -v

# 2. Masuk ke folder proyek dan pasang dependensi
npm install --legacy-peer-deps

# 3. Jalankan migrasi basis data SQLite
npx prisma migrate dev --name init

# 4. Masukkan data dummy awal untuk demo
npx prisma db seed

# 5. Jalankan server lokal
npm run dev
```
Akses di browser: `http://localhost:3000`.

---

## 9. Tanya Jawab & Pemecahan Masalah (FAQ & Troubleshooting)

#### Q: Mengapa kartu yang di-drag ke posisi paling bawah sempat jatuh di tengah?
**A:** Masalah ini telah diperbaiki di versi terbaru! Sistem kini menggunakan deteksi batas tengah vertikal (*vertical midpoint*) dan sinkronisasi indeks lokal dengan server action secara atomik, sehingga kartu akan mendarat persis di urutan terbawah sesuai indikator preview.

#### Q: Bagaimana cara menginstal aplikasi ini di smartphone (PWA)?
**A:** Buka tautan live di browser ponsel (Chrome/Safari), klik tombol menu browser (titik tiga atau tombol Share), lalu pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**. Aplikasi akan terpasang dengan logo TaskFlow resmi dan berjalan layaknya aplikasi native tanpa bar URL browser.

#### Q: Data apa saja yang tersimpan saat memindahkan kartu?
**A:** Setiap perpindahan kartu dicatat di tabel riwayat aktivitas (*Activity log*), mencakup identitas pengguna, waktu perpindahan, kolom asal, kolom tujuan, serta posisi baru untuk kebutuhan audit dan metrik pelaporan.

---

*Dokumentasi ini disusun oleh tim pengembang TaskFlow.*  
*Untuk kendala teknis atau saran fitur, silakan hubungi pengelola proyek.*
