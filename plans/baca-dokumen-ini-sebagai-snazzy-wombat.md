# RapiKasir — Rencana Build

> Fase 5 (terbaru): **Admin internal & Payment/Upgrade** — lihat bagian paling bawah dokumen.
> Fase 4 (Pre-login screens): **Selesai diimplementasikan.**

---

# Fase 1

## Context

Dokumen `rapikasir-design-prompt.md` adalah design brief untuk **RapiKasir**, SaaS POS untuk UMKM Indonesia dengan konsep **"Premium Brutalism"** (palet "Forest Premium", border tebal, offset shadow, bento grid). Brief menargetkan dua audiens: investor (butuh kredibilitas) dan founder Gen Z (butuh modern & bold). Tier gating (Free/Trial Pro/Pro/Business) adalah anchor upsell utama.

**Keputusan lingkup (dikonfirmasi user):**
- Bangun **3 screen prioritas**: Dashboard, Transaksi/POS, dan Pricing/Paket — sebagai satu app ber-routing (`react-router` sudah terpasang).
- Tier gating: default **FREE** + **switcher paket live** (FREE/PRO/BUSINESS) untuk mendemokan efek locked/unlocked. State tier disimpan via React Context.

Screen Laporan & Produk ditunda ke iterasi berikutnya (sidebar tetap menampilkan menunya, mengarah ke placeholder "Segera hadir").

## Temuan codebase

- **Bukan** `@make-kits` — ini shadcn/ui lokal di `src/app/components/ui/` (46 komponen: Button, Card, Badge, Input, Table, Tabs, Progress, Tooltip, Dialog, Select, dll). Wajib pakai ini, bukan bikin custom.
- Terpasang: `lucide-react` (ikon), `recharts` (chart), `motion` (animasi), `react-router` 7, `react-hook-form`.
- Token tema di `src/styles/theme.css` (CSS custom properties → Tailwind color utilities). `src/styles/fonts.css` kosong (tempat import font).
- `ImageWithFallback` ada di `src/app/components/figma/ImageWithFallback.tsx`.
- `App.tsx` masih stub kosong.

## Klasifikasi Supabase
**PureFrontend** — semua data placeholder/mock, tanpa persistensi backend. Tidak menjalankan skill Supabase.

---

## Rencana Implementasi

### 1. Design tokens — "Forest Premium"
**File: `src/styles/fonts.css`** (di paling atas)
- Import Google Fonts: **Plus Jakarta Sans** (heading/metrics) & **Inter** (body). (Sora opsional; pilih Plus Jakarta Sans sebagai display sesuai brief.)

**File: `src/styles/theme.css`** (override `:root`, JANGAN sentuh `@theme inline` mapping kecuali menambah token baru)
- Petakan palet eksak brief ke token:
  - `--background: #F7F5F0`, `--card: #FFFFFF`, `--foreground: #1A1A1A`
  - `--primary: #0D3320`, hover/secondary `#1A5C38`
  - `--accent`/CTA amber `#F5A623`, `--destructive: #D94F3D`, success `#2D9E6B`
  - `--border: #1A1A1A` (border gelap = signature brutalist)
  - `--muted-foreground: #6B6B6B`
  - `--radius: 6px` (slightly square)
  - Sidebar tokens → forest green (`--sidebar: #0D3320`, foreground putih)
- Tambah token kustom untuk block accents: `--block-amber: #FFF3D6`, `--block-green: #E8F4EE`, dan `--color-success` / warna sukses ke `@theme inline`.
- Set family: `--font-sans` (Inter untuk body), tambahkan util family display via class.
- Definisikan util shadow brutalist sekali: `.shadow-brutal { box-shadow: 4px 4px 0 #1A1A1A; }` + varian hover, di `theme.css` (`@layer components` atau utilities).

### 2. Infrastruktur app
**File: `src/app/App.tsx`**
- Bungkus dengan `<TierProvider>` + `react-router` (`createBrowserRouter` / `<Routes>`), layout dengan sidebar+header persist, `<Outlet>` untuk konten.
- Rute: `/` (Dashboard), `/transaksi` (POS), `/paket` (Pricing), plus `/produk`, `/stok`, `/laporan`, `/pengaturan` → komponen `ComingSoon`.

**File baru: `src/app/context/tier-context.tsx`**
- Context menyimpan `tier: 'FREE' | 'TRIAL' | 'PRO' | 'BUSINESS'`, default `FREE`, dengan setter. Helper `canUse(feature)` berbasis matriks tier dari brief.

**File baru: `src/app/data/mock-data.ts`**
- Data placeholder realistis IDR & Bahasa Indonesia: produk (Kopi Susu, Nasi Goreng, dll dengan harga/stok/kategori), transaksi terakhir, top products, metrik dashboard, definisi 4 paket + matriks fitur.

**File baru: `src/app/lib/format.ts`**
- `formatIDR()` (Rp 25.000) dan util persentase.

### 3. Layout bersama
**File baru: `src/app/components/layout/sidebar.tsx`**
- Sidebar forest green 240px, collapsible ke 64px (animasi 200ms). Item: Dashboard, Transaksi, Produk, Stok, Laporan, Pengaturan, **Paket & Upgrade** (highlight amber). Active state. Badge "Paket FREE" + pill "Upgrade" di bawah, avatar + nama toko ("Warung Bu Sari").

**File baru: `src/app/components/layout/topbar.tsx`**
- Store selector, search bar, bell (badge low-stock), avatar dropdown, dan **Tier Switcher** demo (Select FREE/PRO/BUSINESS) yang mengubah TierContext live.

**File baru: `src/app/components/shared/tier-lock.tsx`**
- Overlay reusable: badge tier + tooltip "Upgrade ke Pro", fade 150ms. Dipakai lintas screen.

**File baru: `src/app/components/shared/coming-soon.tsx`** — placeholder halaman belum dibangun.

### 4. Screen 1 — Dashboard
**File baru: `src/app/pages/dashboard.tsx`** (+ komponen bento di `components/dashboard/`)
- Bento grid (CSS grid, ukuran blok variabel 1x1/2x1) sesuai brief:
  - [2x1] Hero revenue hari ini (angka besar Plus Jakarta Sans, aksen amber, tren % vs kemarin) — pakai Card + `.shadow-brutal`.
  - [1x1] Jumlah transaksi + mini sparkline (recharts).
  - [1x1] Produk aktif.
  - [2x1] Top 5 produk terlaris — horizontal bar chart (recharts).
  - [1x1] Low stock alert (aksen merah, badge count, pulse halus via motion).
  - [2x1] Transaksi terakhir (Table, 8 baris, badge metode bayar).
  - [1x1] CTA "+ Transaksi Baru" (amber) → `/transaksi`; [1x1] "+ Tambah Produk" (outline).
- Hover bento: border → amber + elevasi kecil.

### 5. Screen 2 — Transaksi / POS
**File baru: `src/app/pages/pos.tsx`** (+ `components/pos/`)
- Split layout: kiri katalog (search, filter kategori pills/Tabs, grid kartu produk: gambar via ImageWithFallback, nama, harga, badge stok). Produk terkunci (Free) → overlay `TierLock`.
- Kanan cart: daftar item + kontrol qty (+/-), subtotal, input diskon (locked non-Pro), pemilih metode bayar (Cash/Transfer/QRIS — QRIS lock utk Free), total besar, tombol "Proses Transaksi" full-width amber. State cart lokal (`useState`).

### 6. Screen 4 — Pricing / Paket
**File baru: `src/app/pages/pricing.tsx`** (+ `components/pricing/`)
- 4 kartu paket berdampingan (2x2 di viewport sempit): nama+tagline, harga besar, CTA, daftar fitur ✓/✗.
- Kartu **Pro**: border hijau + badge "Paling Populer". Kartu **Business**: background `#0D3320` teks putih.
- Di bawah: tabel perbandingan fitur lengkap lintas tier (Table). CTA paket mengubah TierContext (demo).

### 7. Interaksi & polish (motion)
- Tombol active `scale(0.97)` 160ms ease-out; transisi 150–200ms ease-out global; sidebar collapse 200ms; tier lock fade 150ms; low-stock pulse halus. Semua via `motion/react` atau util transition Tailwind. Hindari animasi loading dekoratif.

---

## Verifikasi
- Dev server sudah berjalan (jangan start manual / jangan `build`). Verifikasi lewat preview surface, bukan localhost.
- Cek: (1) Dashboard render bento grid tanpa error; (2) navigasi sidebar antar `/`, `/transaksi`, `/paket` bekerja; (3) sidebar collapse; (4) **switcher tier** mengubah locked/unlocked live di POS (diskon/QRIS) & Pricing (highlight paket aktif); (5) tambah item ke cart + qty + total terhitung benar (formatIDR); (6) responsif (bento & pricing melipat di lebar sempit).
- Konfirmasi palet & font sesuai brief (background hangat #F7F5F0, forest green sidebar, border gelap + offset shadow, heading Plus Jakarta Sans / body Inter).
- Jalankan `pnpm` install hanya bila ada paket kurang (kemungkinan tidak perlu — semua sudah terpasang).

---

# Fase 4 — Pre-login Screens (Landing, Register, Login, Onboarding)

## Context
Aplikasi saat ini langsung masuk ke dashboard tanpa alur masuk. User meminta pintu depan produk: **Landing Page** (marketing, menghadap investor & Gen Z), **Register** dengan pemilihan paket (Free/Pro/Business), **Login**, dan **Onboarding** setup toko pertama kali. Tujuannya: alur "guest → daftar/masuk → setup toko → dashboard" yang utuh dan bisa didemokan, konsisten dengan design system "Premium Brutalism" (palet Forest Premium, border 2px, `shadow-brutal`, font display Plus Jakarta Sans).

**Keputusan (dikonfirmasi user):**
- **Auth = mock frontend** (tanpa backend). Akun & sesi disimpan di `localStorage`; semua kredensial diterima (demo). Klasifikasi: **PureFrontend** — tidak menjalankan skill Supabase.
- **Landing lengkap**: hero, fitur unggulan, preview harga (4 paket), testimoni/kepercayaan, CTA, footer.

## Arsitektur & alur

### AuthProvider baru — `src/app/context/auth-context.tsx`
Context memegang sesi mock, di-*persist* ke `localStorage` (key mis. `rapikasir.auth`), init dari storage saat mount.
- State: `status: 'guest' | 'authed'`, `onboarded: boolean`, `user: { name, email }`, `store: { name, ownerName, category, phone }`.
- Methods: `register({ name, email, password, tier })`, `login({ email, password })`, `completeOnboarding(store)`, `logout()`.
- **Nest di dalam `TierProvider`** agar `register` bisa memanggil `useTier().setTier(tier)` — pilihan paket saat daftar langsung jadi tier aktif aplikasi. `login` → `authed` + `onboarded=true` (akun demo dianggap sudah setup) → dashboard. `register` → `authed` + `onboarded=false` → paksa ke `/onboarding`.
- Hook `useAuth()`.

### Routing kondisional — `src/app/App.tsx`
Susun ulang jadi tiga pohon route berdasarkan state (tetap **mempertahankan path app yang ada** supaya link sidebar tidak berubah):
- `status==='guest'` → `/` = **Landing**, `/login`, `/register`; `*` → redirect `/`.
- `status==='authed' && !onboarded` → `/onboarding`; path lain redirect ke `/onboarding`.
- `status==='authed' && onboarded` → pohon `AppLayout` yang sekarang (Dashboard `/`, `/transaksi`, `/paket`, `/produk`, `/stok`, `/laporan`, `/pengaturan`), plus redirect `/login`,`/register` → `/`.
- Provider nesting akhir: `TierProvider` → `AuthProvider` → `Toaster` → `BrowserRouter` → route tree. Gunakan `<Navigate>` untuk redirect.

### Store info dari onboarding
Ganti pemakaian konstanta `STORE_NAME`/`OWNER_NAME` di `src/app/components/layout/sidebar.tsx` dan `topbar.tsx` agar membaca `useAuth().store` (fallback ke konstanta lama di `mock-data.ts` bila kosong). Dengan begitu nama toko/pemilik hasil onboarding langsung tampil di sidebar & topbar.
Wire tombol **"Keluar"** di dropdown user (`topbar.tsx`) ke `logout()` → kembali ke Landing (agar demo bisa diulang).

## Screen baru (semua di `src/app/pages/`, responsif 375px)

### `auth-shell.tsx` (helper, `src/app/components/auth/`)
Layout kartu terpusat untuk Login/Register/Onboarding: background hangat `bg-background`, panel brand kiri (forest green, logo RapiKasir, tagline) yang tampil di `lg:` dan disembunyikan di mobile; area form kanan dengan kartu `border-2 shadow-brutal`. Reuse token & util yang ada.

### `landing.tsx`
Section berurutan, semua pakai token/`shadow-brutal`/`BentoCard`:
1. **Nav sticky** — logo + tombol "Masuk" (→`/login`) & "Coba Gratis" (→`/register`).
2. **Hero** — headline besar (font-display), subcopy, CTA ganda ("Coba Gratis" amber + "Lihat Harga" outline), aksen amber.
3. **Trust bar** — statistik/angka kepercayaan (mis. "10.000+ UMKM", "Rp X diproses").
4. **Fitur unggulan** — grid `BentoCard` (kasir cepat, kelola stok, laporan laba, multi-cabang) dengan ikon lucide.
5. **Preview harga** — reuse `PLANS` dari `mock-data.ts` → 4 kartu (highlight Pro, Business dark), tiap CTA menuju `/register?tier=<TIER>`.
6. **Testimoni** — 2–3 kartu quote pemilik UMKM (data mock Indonesia).
7. **CTA band** + **Footer** (link dummy, © RapiKasir).

### `register.tsx`
- Field: nama, email, password (+ konfirmasi) pakai `Input`/`Label`.
- **Tier picker**: reuse `PLANS` sebagai kartu terpilih (radio-like), highlight pilihan; prefill dari query `?tier=` (pakai `useSearchParams`). Default FREE.
- Submit → `register({...})` → toast sukses → redirect `/onboarding`. Link "Sudah punya akun? Masuk" → `/login`.

### `login.tsx`
- Field email + password (mock, semua diterima), tombol "Masuk", link "Daftar". Submit → `login()` → dashboard.

### `onboarding.tsx`
- Wizard 2 langkah (progress bar/indikator): **(1) Profil toko** — nama toko, jenis usaha (pilihan: Warung Makan, Kedai Kopi, Toko Kelontong, Laundry, Retail, dll), nama pemilik, no. HP (opsional); **(2) Ringkasan & selesai** — tampilkan ringkasan + paket aktif (dari `useTier`).
- Submit akhir → `completeOnboarding(store)` → toast → redirect `/` (dashboard). Sapaan personal ("Selamat datang, <nama toko>!").

## Komponen/utilitas yang dipakai ulang
- `PLANS`, `FEATURE_MATRIX`, `CATEGORIES` di `src/app/data/mock-data.ts`.
- `useTier`/`setTier`/`TIER_LABEL` di `src/app/context/tier-context.tsx`.
- UI: `Input`, `Label`, `Button`, `Card`, `Badge`, `RadioGroup`/`Select`, `Separator`, `Progress` di `src/app/components/ui/`.
- `BentoCard`, `TierBadge` di `src/app/components/shared/`; `toast` dari `sonner`; ikon `lucide-react`.
- Token/util: `shadow-brutal(-sm)`, `press-scale`, `font-display`, `bg-block-amber/green`, warna `primary/accent/success` (`src/styles/theme.css`).

## File yang dibuat/diubah
- **Baru**: `src/app/context/auth-context.tsx`; `src/app/components/auth/auth-shell.tsx`; `src/app/pages/{landing,register,login,onboarding}.tsx`.
- **Ubah**: `src/app/App.tsx` (routing kondisional + provider), `src/app/components/layout/sidebar.tsx` & `topbar.tsx` (baca store dari `useAuth`, wire logout), opsional tambah default store di `src/app/data/mock-data.ts`.

## Verifikasi (end-to-end di preview surface, bukan localhost)
1. Guest: buka `/` → **Landing** tampil lengkap (semua section, responsif 375px). Klik CTA harga "Pilih Pro" → `/register?tier=PRO` dengan Pro ter-preselect.
2. Register: isi form, pilih paket, submit → diarahkan ke **Onboarding**.
3. Onboarding: isi profil toko (nama "Kopi Kita" dll), selesaikan → masuk **Dashboard**; sidebar & topbar menampilkan nama toko/pemilik dari onboarding, dan tier sesuai pilihan (mis. PRO membuka fitur di POS/Laporan).
4. Logout (dropdown user) → kembali ke Landing. Login kembali → langsung Dashboard.
5. Refresh halaman saat authed → tetap login (persist localStorage).
6. Cek semua screen baru di 375px (auth-shell single column, landing section menumpuk, tier picker stack).
7. Tidak ada warning React baru; palet/font konsisten dengan design system.

---

# Fase 5 — Admin Internal & Payment/Upgrade

## Context
Tambahan dari luar scope Fase 4: prototipe HTML statis terpisah (dibuat di Claude Sonnet, bukan Figma Make) untuk **Monitor Subscription/Admin internal** (3 layar: Dashboard Admin, Manajemen User, Monitor Subscription — tema dark forest terpisah dari app konsumen) dan **halaman Payment/Upgrade Paket** (checkout terpisah dari Pricing yang sudah ada). Dikonversi & digabung ke project React/Vite ini agar satu app utuh.

## Yang ditambahkan
- **`src/styles/theme.css`**: token warna admin (`--admin-bg`, `--admin-surface`, `--admin-border`, dst — dipetakan ke `@theme inline` sebagai `--color-admin-*`), plus utility yang sebelumnya belum ada: `.shadow-brutal-lg`, `.shadow-brutal-amber-sm`, `.hover-lift`, `.tnum`, animasi `.rk-rise`/`.rk-reveal` (scroll-reveal), `.admin-scope`.
- **`src/app/lib/use-scroll-reveal.ts`**: hook pengganti `rkInitScrollReveal` dari prototipe statis (IntersectionObserver untuk elemen `.rk-reveal`).
- **`src/app/context/auth-context.tsx`**: `AuthProvider` mock (persist ke `localStorage`, key `rapikasir.auth`), sesuai spek Fase 4 — `register/login/completeOnboarding/logout`. Di-nest di dalam `TierProvider`.
- **Halaman pre-login**: `pages/landing.tsx`, `pages/login.tsx`, `pages/register.tsx`, `pages/onboarding.tsx` (wizard 3 langkah: Profil Toko → Estimasi Produk → Konfirmasi) + `components/auth/auth-shell.tsx`.
- **Halaman payment**: `pages/payment.tsx` — standalone (bukan di dalam `AppLayout`), route `/pembayaran?plan=PRO|BUSINESS`. Dipanggil dari `pricing.tsx`: paket berbayar (Pro/Business) sekarang mengarah ke `/pembayaran` alih-alih instan `setTier`; paket gratis (Free/Trial) tetap instan seperti sebelumnya. Konfirmasi pembayaran di halaman ini yang benar-benar memanggil `setTier`.
- **Admin internal** (tidak digerbang oleh auth konsumen, sama seperti prototipe statis aslinya): `components/layout/admin-layout.tsx` (sidebar dark-forest + drawer mobile + topbar per-halaman), `pages/admin/dashboard.tsx`, `pages/admin/users.tsx`, `pages/admin/subscriptions.tsx` (termasuk export CSV). Rute: `/admin`, `/admin/users`, `/admin/subscriptions`.
- **`data/mock-data.ts`**: tambah `STORE_CATEGORIES`, `PRODUCT_QTY_OPTIONS`, `TESTIMONIALS`, `EWALLET_METHODS`, `BANK_METHODS`, `ADMIN_USERS`, `ADMIN_TRANSACTIONS`.
- **`App.tsx`**: dibungkus ulang jadi `AuthProvider` + `AppRoutes` yang bercabang berdasar `status`/`onboarded` (persis skema Fase 4), ditambah rute `/pembayaran` dan `/admin/*` di setiap cabang.
- **`sidebar.tsx` & `topbar.tsx`**: nama toko/pemilik sekarang baca dari `useAuth().store` (fallback ke `STORE_NAME`/`OWNER_NAME` bila belum onboarding), tombol **Keluar** di-wire ke `logout()` beneran.

## Verifikasi yang sudah dilakukan
- `tsc --noEmit` (strict mode) atas seluruh `src/`: **0 error**.
- `vite build`: sukses, 2739 modul, tidak ada error (hanya warning ukuran chunk, wajar untuk stack MUI+Radix+Recharts+Motion yang sudah ada sebelumnya).
- Dicek manual bahwa semua class admin-* & utility baru benar-benar muncul di CSS hasil build (bukan cuma didefinisikan tapi tidak ke-generate Tailwind v4).

## Belum diverifikasi (perlu dicek di preview surface / browser asli)
1. Alur end-to-end: Landing → Register (pilih Pro) → Onboarding (3 langkah) → Dashboard, tier ikut PRO.
2. Landing → Register (Free) → Onboarding → Dashboard → klik "Paket & Upgrade" → Pricing → pilih Pro/Business → `/pembayaran` → pilih metode → "Saya Sudah Bayar" → tier ter-upgrade + toast.
3. Login (email/password bebas) → langsung ke Dashboard tanpa onboarding ulang.
4. Refresh saat sudah login → tetap login (localStorage persist).
5. Logout dari dropdown user (topbar) atau tombol Keluar (sidebar) → kembali ke Landing.
6. `/admin`, `/admin/users`, `/admin/subscriptions` bisa diakses langsung tanpa login konsumen; search/filter/export CSV di halaman user & subscription jalan.
7. Responsif 375px untuk semua layar baru (auth-shell, tier picker, stepper onboarding, admin table overflow-x).
