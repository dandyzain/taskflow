# 📋 TaskFlow — Panduan Pengguna Lengkap (User Guide)

Selamat datang di **TaskFlow**, aplikasi manajemen proyek berbasis papan Kanban kolaboratif yang modern, cepat, dan intuitif. TaskFlow dirancang untuk membantu tim dan individu mengelola alur kerja, memprioritaskan tugas, serta melacak progres proyek secara visual.

Panduan ini berisi instruksi menyeluruh untuk pengguna maupun pengembang mengenai cara menjalankan, mengoperasikan, dan memanfaatkan setiap fitur yang ada di TaskFlow.

---

## 📑 Daftar Isi

1. [Gambaran Umum & Fitur Utama](#1-gambaran-umum--fitur-utama)
2. [Persyaratan Sistem & Instalasi Cepat](#2-persyaratan-sistem--instalasi-cepat)
3. [Navigasi Antarmuka & Manajemen Ruang Kerja](#3-navigasi-antarmuka--manajemen-ruang-kerja)
4. [Mengelola Board & Kolom Kanban](#4-mengelola-board--kolom-kanban)
5. [Manajemen Kartu Tugas (Cards)](#5-manajemen-kartu-tugas-cards)
6. [Pencarian & Multi-Filter Cepat](#6-pencarian--multi-filter-cepat)
7. [Pintasan Keyboard (Keyboard Shortcuts)](#7-pintasan-keyboard-keyboard-shortcuts)
8. [Riwayat Aktivitas Tim (Activity Feed & Audit Trail)](#8-riwayat-aktivitas-tim-activity-feed--audit-trail)
9. [Mode Gelap / Terang (Theme Toggle)](#9-mode-gelap--terang-theme-toggle)
10. [Referensi Perintah & Pemecahan Masalah (Troubleshooting)](#10-referensi-perintah--pemecahan-masalah-troubleshooting)

---

## 1. Gambaran Umum & Fitur Utama

TaskFlow menggabungkan fleksibilitas metodologi Kanban dengan teknologi web modern:

- **Full-Stack Next.js 15 & React 19**: Menggunakan Server Actions untuk mutasi data yang cepat dan aman.
- **Interaksi Drag-and-Drop Responsif**: Ditenagai oleh `@dnd-kit` untuk pemindahan kartu dan penataan ulang kolom secara horizontal dan vertikal.
- **Manajemen Metadata Tugas Lengkap**: Prioritas tugas, tenggat waktu (*due date*), multi-label warna, dan penugasan anggota (*assignees*).
- **Audit Trail & Activity Log**: Mencatat setiap perubahan penting (pembuatan, pemindahan, pengubahan, hingga penghapusan tugas/kolom).
- **Filter & Pencarian Real-Time**: Temukan tugas secara instan berdasarkan kata kunci teks, label, atau prioritas.
- **Pintasan Keyboard**: Navigasi cepat tanpa perlu mengangkat tangan dari keyboard.
- **Dukungan Dark Mode & Light Mode**: Desain antarmuka fleksibel yang nyaman di mata.

---

## 2. Persyaratan Sistem & Instalasi Cepat

### Prasyarat:
- **Node.js**: Versi 18.18 atau lebih baru (direkomendasikan Node.js 20+ LTS).
- **npm** (atau `pnpm` / `yarn`).
- **Database**: SQLite lokal (bawaan, tidak memerlukan konfigurasi server database terpisah).

### Langkah Instalasi:

1. **Buka terminal** di direktori proyek `taskflow`:
   ```bash
   cd taskflow
   ```

2. **Pasang dependensi**:
   ```bash
   npm install
   ```

3. **Periksa berkas konfigurasi lingkungan (`.env`)**:
   Pastikan berkas `.env` ada di root direktori dengan isi default SQLite:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Inisialisasi Database & Seeding Data Awal**:
   Jalankan migrasi database dan masukkan data demonstrasi awal (Board, Kolom, Kartu, Label, dan Pengguna contoh):
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```

6. **Akses Aplikasi**:
   Buka browser dan kunjungi:
   ```text
   http://localhost:3000
   ```
   Aplikasi akan otomatis mengarahkan Anda ke board utama:
   `http://localhost:3000/workspace/ws_demo/board/board_demo`

### Data Demo yang Tersedia:
- **Workspace**: *Demo Workspace* (`ws_demo`)
- **Papan Utama**: *Sprint Board* (`board_demo`)
- **Kolom Awal**: Backlog, To Do, In Progress, Done
- **Pengguna Contoh**:
  - Demo User (`demo@taskflow.dev`) — Admin
  - Sarah Chen (`sarah@taskflow.dev`) — Member
  - Alex Kim (`alex@taskflow.dev`) — Member

---

## 3. Navigasi Antarmuka & Manajemen Ruang Kerja

Antarmuka TaskFlow terbagi menjadi dua area utama:

```
┌─────────────────┬────────────────────────────────────────────────────────┐
│  SIDEBAR        │  HEADER BOARD (Judul, Deskripsi, Tombol Activity)      │
│  - Workspace    ├────────────────────────────────────────────────────────┤
│  - Theme Toggle │  TOOLBAR (Search bar, Filter Prioritas, Filter Label)  │
│  - Daftar Board ├────────────────────────────────────────────────────────┤
│  - Tombol (+)   │  KANBAN BOARD CANVAS                                   │
│                 │  [ Kolom 1 ]    [ Kolom 2 ]    [ Kolom 3 ]   [+ Kolom] │
│                 │  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│                 │  │ Kartu A │    │ Kartu C │    │ Kartu E │             │
│                 │  ├─────────┤    └─────────┘    └─────────┘             │
│                 │  │ Kartu B │                                           │
│                 │  └─────────┘                                           │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### Menggunakan Sidebar:
1. **Peralihan Board**: Klik nama board pada daftar sidebar untuk langsung berpindah antar papan kerja.
2. **Membuat Board Baru**:
   - Klik ikon plus (**`+`**) di sebelah kanan header "BOARDS" pada sidebar.
   - Masukkan **Board Title** (contoh: *Q4 Product Roadmap*).
   - Masukkan **Description** (opsional).
   - Klik tombol **Create Board**. Halaman akan langsung dialihkan ke papan baru Anda.
3. **Menghapus Board**:
   - Arahkan kursor (*hover*) pada salah satu board di sidebar.
   - Ikon tempat sampah (**Trash**) akan muncul.
   - Klik ikon tersebut dan konfirmasi dialog untuk menghapus board beserta seluruh isinya.

---

## 4. Mengelola Board & Kolom Kanban

### Mengubah Judul & Deskripsi Board:
- **Judul**: Klik teks judul board di bagian atas halaman untuk masuk ke mode edit inline. Ubah teks lalu tekan **Enter** atau klik di luar area untuk menyimpan. Tekan **Escape** untuk membatalkan.
- **Deskripsi**: Klik teks deskripsi (atau tulisan *"Click to add description..."*), ubah catatan deskripsi, lalu klik di luar area input untuk menyimpan otomatis.

### Menambahkan Kolom Baru:
- Geser papan ke ujung paling kanan.
- Pada form **"+ Add another column"**, ketikkan nama kolom (misalnya: *Review*, *QA*, atau *Archived*).
- Tekan tombol **Add Column** atau tekan **Enter**.

### Menata Ulang Kolom (Reorder Columns):
- Klik dan tahan pada area header kolom atau pegangan drag handle.
- Geser kolom ke kiri atau ke kanan untuk mengubah urutan alur kerja Anda.
- Lepaskan mouse, urutan baru akan disimpan secara otomatis.

### Mengubah & Menghapus Kolom:
- **Edit Nama Kolom**: Klik judul kolom untuk mengedit namanya secara langsung, lalu tekan **Enter**.
- **Hapus Kolom**: Klik ikon tempat sampah (**Trash**) di sudut kanan atas kolom. Konfirmasikan penghapusan (perhatian: semua kartu di dalam kolom tersebut akan ikut terhapus).

---

## 5. Manajemen Kartu Tugas (Cards)

### 1. Menambahkan Kartu Baru (Quick Add)
- Di bagian bawah kolom manapun, klik tombol **"+ Add a card"**.
- Masukkan judul tugas pada kolom input.
- Tekan **Enter** atau klik **Add Card** untuk menyimpan.
- Tekan **Escape** atau tombol **X** untuk membatalkan.

### 2. Memindahkan Kartu (Drag and Drop)
- **Dalam Kolom yang Sama**: Seret kartu ke atas atau ke bawah untuk menentukan prioritas urutan pelaksanaan.
- **Antar Kolom**: Seret kartu dari satu kolom ke kolom lain (misalnya dari *To Do* ke *In Progress*).
- Status dan posisi kartu diperbarui seketika (*optimistic update*) dan tersimpan ke database.

### 3. Mengedit Detail Kartu (Card Detail Modal)
Klik pada kartu untuk membuka jendela rincian tugas. Di sini Anda dapat mengatur:

- **Judul Tugas**: Klik pada teks judul di bagian atas modal untuk mengubahnya. Perubahan tersimpan saat keluar dari fokus (*blur*) atau menekan Enter.
- **Deskripsi Lengkap**: Masukkan ringkasan, catatan teknis, atau spesifikasi pengerjaan pada kotak teks *Description*.
- **Tingkat Prioritas (Priority)**:
  Pilih salah satu dari 4 level:
  - **None (0)**: Tugas standar tanpa urgensi khusus.
  - **Low (1)**: Label abu-abu (*Secondary*).
  - **Medium (2)**: Label gelap/netral (*Default*).
  - **High (3)**: Label merah cerah (*Destructive*) untuk tugas kritis atau mendesak.
- **Tenggat Waktu (Due Date)**:
  - Pilih tanggal melalui *date picker*.
  - Indikator cerdas akan tampil pada kartu:
    - 🔴 **Merah**: Tugas telah melewati batas waktu (*Overdue*).
    - 🟠 **Oranye**: Tugas jatuh tempo dalam kurun waktu 2 hari ke depan (*Due Soon* / *Today* / *Tomorrow*).
    - ⚪ **Netral**: Masih memiliki waktu pengerjaan lebih dari 2 hari.
  - Klik **Clear** jika ingin menghapus tenggat waktu.
- **Label / Tag Berwarna**:
  - Klik **Add Label** untuk memilih label yang sudah ada (misal: *Bug*, *Feature*, *Docs*, *Urgent*).
  - Anda juga dapat membuat label baru secara langsung: ketik nama label, pilih warna dari palet, lalu simpan.
- **Penugasan Anggota (Assignees)**:
  - Klik **Assign** untuk memilih anggota tim yang bertanggung jawab atas tugas tersebut.
  - Inisial avatar anggota akan muncul di kartu pada papan Kanban.
- **Menghapus Kartu**:
  - Klik tombol **Delete Card** berwarna merah di sudut kiri bawah modal jika tugas ingin dibatalkan/dihapus secara permanen.

---

## 6. Pencarian & Multi-Filter Cepat

TaskFlow menyediakan toolbar pencarian terpadu di bagian atas papan:

```
[ 🔍 Search cards... (/) ]  [ 🔻 All Priorities ]  [ 🏷️ All Labels ]  [ ✕ Clear filters (2) ]
```

1. **Pencarian Teks Instan**:
   - Ketikkan kata kunci pada kotak input pencarian.
   - Kartu yang judul atau deskripsinya cocok akan langsung disaring secara dinamis.
2. **Filter Berdasarkan Prioritas**:
   - Pilih tingkat prioritas tertentu (High, Medium, Low, None) untuk memfokuskan pengerjaan pada tugas yang paling mendesak.
3. **Filter Berdasarkan Label**:
   - Pilih label spesifik (misal hanya menampilkan kartu berlabel *Bug*).
4. **Mereset Filter**:
   - Ketika ada filter yang aktif, tombol **Clear filters** dengan penanda jumlah filter aktif akan muncul. Klik tombol ini atau tekan tombol keyboard **Escape** untuk kembali menampilkan seluruh kartu.

---

## 7. Pintasan Keyboard (Keyboard Shortcuts)

Tingkatkan produktivitas kerja dengan memanfaatkan navigasi cepat keyboard:

| Tombol | Fungsi | Keterangan |
| :--- | :--- | :--- |
| **`/`** | **Fokus ke Kolom Pencarian** | Langsung mengarahkan kursor ke input pencarian kartu tanpa perlu menggunakan mouse. |
| **`Escape`** | **Tutup Modal / Bersihkan Filter** | Menutup modal yang sedang terbuka, membersihkan teks pencarian, atau mereset filter yang aktif. |
| **`?`** *(Shift + `/`)* | **Buka Panduan Pintasan** | Membuka jendela dialog pintasan keyboard resmi. |

> 💡 **Tips**: Anda juga dapat mengklik tombol bulat ikon keyboard (**`?`**) di pojok kanan bawah layar kapan saja untuk melihat dialog bantuan pintasan.

---

## 8. Riwayat Aktivitas Tim (Activity Feed & Audit Trail)

Untuk transparansi dan kolaborasi tim yang rapi, TaskFlow mencatat riwayat perubahan penting pada setiap workspace.

### Cara Melihat Riwayat:
1. Klik tombol **Activity** (berikon grafik denyut) di sudut kanan atas header board.
2. Panel samping (*Slide-over Sheet*) akan muncul dari sisi kanan layar.
3. Anda dapat memantau:
   - Siapa yang membuat, memindahkan, atau menghapus kartu.
   - Kapan kolom baru ditambahkan atau diubah.
   - Waktu relatif kejadian (misal: *just now*, *5m ago*, *2h ago*, *yesterday*).
   - Tag warna entitas (Biru untuk Kartu, Ungu untuk Kolom, Hijau untuk Board).

---

## 9. Mode Gelap / Terang (Theme Toggle)

TaskFlow mendukung tema visual yang fleksibel:
- Temukan tombol sakelar tema (ikon Matahari ☀️ / Bulan 🌙) di bagian paling atas Sidebar.
- Klik tombol tersebut untuk beralih instan antara:
  - **Light Mode**: Tampilan bersih dan kontras tinggi untuk siang hari.
  - **Dark Mode**: Tampilan gelap elegan yang nyaman untuk mata saat bekerja di ruangan redup atau malam hari.

---

## 10. Referensi Perintah & Pemecahan Masalah (Troubleshooting)

### Perintah Skrip NPM yang Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server aplikasi Next.js pada mode development (`http://localhost:3000`). |
| `npm run build` | Melakukan build produksi yang teroptimasi. |
| `npm run start` | Menjalankan server dalam mode produksi setelah di-build. |
| `npm run lint` | Menjalankan pengecekan kualitas kode dengan ESLint. |
| `npm run db:migrate` | Menerapkan migrasi skema database Prisma terbaru. |
| `npm run db:generate` | Menghasilkan ulang Prisma Client TypeScript definitions. |
| `npm run db:seed` | Mengisi database dengan data awal demonstrasi (*seed data*). |
| `npm run db:studio` | Membuka antarmuka visual Prisma Studio di browser untuk melihat isi tabel database. |
| `npm run db:reset` | Mengosongkan database, menjalankan ulang migrasi, dan mengeksekusi seed dari awal. |

### Panduan Pemecahan Masalah (FAQ)

#### 1. Data kartu atau board tidak muncul saat pertama kali dibuka?
- Pastikan Anda telah menjalankan migrasi dan seeding database:
  ```bash
  npx prisma migrate dev
  npm run db:seed
  ```
- Pastikan berkas `dev.db` terbentuk di folder root/prisma.

#### 2. Drag and drop terasa tidak merespons?
- `@dnd-kit` menggunakan sensor pointer dengan batas toleransi gerakan minimum 8 pixel untuk mencegah drag yang tidak disengaja saat ingin mengklik kartu. Klik dan geser sejauh beberapa pixel untuk mulai memindahkan item.

#### 3. Ingin melihat isi database secara langsung?
- Jalankan perintah berikut di terminal baru:
  ```bash
  npm run db:studio
  ```
- Browser akan terbuka di `http://localhost:5555` dan menampilkan seluruh tabel (`User`, `Workspace`, `Board`, `Column`, `Card`, `Label`, `Activity`).

---

**TaskFlow** — *Simple, Powerful, and Collaborative Work Management.*  
Dokumentasi ini dibuat untuk versi aplikasi TaskFlow v0.1.0.
