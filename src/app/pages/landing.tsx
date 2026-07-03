import { Link } from "react-router";
import {
  Store,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  LayoutDashboard,
  Check,
  Star,
  Quote,
} from "lucide-react";
import { PLANS, TESTIMONIALS } from "../data/mock-data";
import { useScrollReveal } from "../lib/use-scroll-reveal";

export function Landing() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      {/* ============ Nav ============ */}
      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 md:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground">
              <Store className="size-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">RapiKasir</span>
          </a>

          <nav className="ml-10 hidden items-center gap-7 md:flex">
            <a href="#fitur" className="text-sm font-medium text-foreground/70 hover:text-foreground">Fitur</a>
            <a href="#harga" className="text-sm font-medium text-foreground/70 hover:text-foreground">Harga</a>
            <a href="#testimoni" className="text-sm font-medium text-foreground/70 hover:text-foreground">Testimoni</a>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-foreground/80 hover:text-foreground sm:block">
              Masuk
            </Link>
            <Link
              to="/register"
              className="press-scale flex items-center gap-1.5 rounded-md border-2 border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-brutal-sm"
            >
              Coba Gratis
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ============ Hero ============ */}
        <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-14 md:px-8 lg:grid-cols-2 lg:gap-8 lg:py-20">
          <div className="rk-rise">
            <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Catat transaksi, kelola usaha lebih rapi.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
              RapiKasir bantu kamu mencatat penjualan, memantau stok, dan melihat laporan usaha, semua dari satu
              aplikasi.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-brutal"
              >
                Coba Gratis Sekarang <ArrowRight className="size-4" />
              </Link>
              <a
                href="#harga"
                className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-card px-6 py-3.5 text-sm font-semibold hover:bg-muted"
              >
                Lihat Harga
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Gratis selamanya untuk paket dasar. Tidak perlu kartu kredit.</p>
          </div>

          {/* Product preview mock */}
          <div className="rk-rise relative" style={{ animationDelay: "120ms" }}>
            <div className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-brutal-lg">
              <div className="flex items-center gap-1.5 border-b-2 border-border bg-muted px-3.5 py-2.5">
                <span className="size-2.5 rounded-full bg-destructive/60" />
                <span className="size-2.5 rounded-full bg-accent/70" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <span className="ml-3 rounded border border-border/40 bg-card px-3 py-1 text-[11px] text-muted-foreground">
                  app.rapikasir.id/dashboard
                </span>
              </div>
              <div className="flex">
                <div className="hidden w-14 shrink-0 flex-col items-center gap-5 bg-primary py-4 sm:flex">
                  <span className="flex size-8 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground">
                    <Store className="size-4" />
                  </span>
                  <LayoutDashboard className="size-4 text-primary-foreground" />
                  <ShoppingCart className="size-4 text-primary-foreground/45" />
                  <Package className="size-4 text-primary-foreground/45" />
                  <BarChart3 className="size-4 text-primary-foreground/45" />
                </div>
                <div className="flex-1 space-y-2.5 bg-background p-3.5">
                  <div className="rounded-md border-2 border-border bg-card p-3 shadow-brutal-sm">
                    <p className="text-[11px] text-muted-foreground">Pendapatan Hari Ini</p>
                    <p className="font-display tnum text-xl font-extrabold sm:text-2xl">Rp 1.840.000</p>
                    <div className="mt-2.5 flex h-8 items-end gap-1">
                      {[35, 55, 40, 70, 50, 90, 65].map((h, i) => (
                        <span
                          key={i}
                          className={`w-full rounded-sm ${i === 5 ? "bg-accent" : "bg-block-green"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-md border-2 border-border bg-block-green p-2.5">
                      <p className="text-[10px] text-muted-foreground">Transaksi</p>
                      <p className="font-display text-base font-bold">142</p>
                    </div>
                    <div className="rounded-md border-2 border-border bg-block-amber p-2.5">
                      <p className="text-[10px] text-muted-foreground">Stok Menipis</p>
                      <p className="font-display text-base font-bold">3 produk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="press-scale absolute -right-3 -top-4 hidden rotate-3 items-center gap-1 rounded-md border-2 border-border bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-brutal-sm sm:flex">
              <TrendingUp className="size-3.5" /> +18% minggu ini
            </div>
          </div>
        </section>

        {/* ============ Trust bar ============ */}
        <section className="border-y-2 border-border bg-muted/50">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 divide-y-2 divide-border px-5 py-6 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0 md:px-8">
            <div className="rk-reveal px-2 py-3 text-center sm:py-0">
              <p className="font-display tnum text-3xl font-extrabold text-primary">8.400+</p>
              <p className="mt-1 text-sm text-muted-foreground">UMKM sudah pakai RapiKasir</p>
            </div>
            <div className="rk-reveal px-2 py-3 text-center sm:py-0" style={{ animationDelay: "80ms" }}>
              <p className="font-display tnum text-3xl font-extrabold text-primary">Rp 340jt+</p>
              <p className="mt-1 text-sm text-muted-foreground">transaksi tercatat tiap bulan</p>
            </div>
            <div className="rk-reveal px-2 py-3 text-center sm:py-0" style={{ animationDelay: "160ms" }}>
              <p className="font-display tnum text-3xl font-extrabold text-primary">4,8 / 5</p>
              <p className="mt-1 text-sm text-muted-foreground">dari 1.200+ ulasan pengguna</p>
            </div>
          </div>
        </section>

        {/* ============ Fitur ============ */}
        <section id="fitur" className="mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-16 md:px-8 sm:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Fitur yang benar-benar dipakai UMKM setiap hari
            </h2>
            <p className="mt-3 text-muted-foreground">
              Bukan fitur numpuk yang jarang disentuh. Tiga hal ini yang paling menentukan usahamu rapi atau tidak.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rk-reveal hover-lift group flex flex-col justify-between overflow-hidden rounded-lg border-2 border-border bg-card p-6 shadow-brutal-sm lg:col-span-2">
              <div>
                <span className="flex size-11 items-center justify-center rounded-md border-2 border-border bg-block-amber">
                  <ShoppingCart className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-xl font-bold">Transaksi secepat kasir modern</h3>
                <p className="mt-2 max-w-[46ch] text-sm text-muted-foreground">
                  Cari produk, terapkan diskon, dan cetak struk tanpa ribet. Setiap transaksi tercatat otomatis, tidak
                  ada lagi buku catatan yang hilang.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-md border-2 border-border bg-background px-2.5 py-1 text-xs font-medium">Cari produk cepat</span>
                <span className="rounded-md border-2 border-border bg-background px-2.5 py-1 text-xs font-medium">Diskon per transaksi</span>
                <span className="rounded-md border-2 border-border bg-background px-2.5 py-1 text-xs font-medium">Cetak &amp; kirim struk</span>
              </div>
            </div>

            <div
              className="rk-reveal hover-lift flex flex-col justify-between rounded-lg border-2 border-border bg-block-green p-6 shadow-brutal-sm"
              style={{ animationDelay: "90ms" }}
            >
              <div>
                <span className="flex size-11 items-center justify-center rounded-md border-2 border-border bg-card">
                  <Package className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-xl font-bold">Stok selalu akurat</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Setiap transaksi otomatis mengurangi stok. Dapat notifikasi begitu produk mulai menipis.
                </p>
              </div>
              <div className="mt-5 rounded-md border-2 border-border bg-card p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span>Kopi Arabika 250g</span>
                  <span className="font-bold text-destructive">4 tersisa</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div className="h-full w-[15%] rounded-full bg-destructive" />
                </div>
              </div>
            </div>

            <div
              className="rk-reveal hover-lift flex flex-col justify-between rounded-lg border-2 border-border bg-card p-6 shadow-brutal-sm lg:col-span-3"
              style={{ animationDelay: "160ms" }}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-md">
                  <span className="flex size-11 items-center justify-center rounded-md border-2 border-border bg-block-amber">
                    <BarChart3 className="size-5" />
                  </span>
                  <h3 className="font-display mt-4 text-xl font-bold">Laporan yang mudah dibaca</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Lihat laba kotor, produk terlaris, dan tren penjualan harian tanpa perlu jadi ahli akuntansi.
                  </p>
                </div>
                <div className="flex shrink-0 items-end gap-1.5 self-stretch sm:self-auto">
                  <div className="flex h-24 w-full items-end gap-1.5 sm:w-40">
                    {[45, 65, 38, 80, 100, 58, 72].map((h, i) => (
                      <span
                        key={i}
                        className={`w-full rounded-sm ${i === 4 ? "bg-accent" : "bg-block-green"}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Harga ============ */}
        <section id="harga" className="scroll-mt-20 border-t-2 border-border bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Mulai gratis, upgrade saat usahamu tumbuh
              </h2>
              <p className="mt-3 text-muted-foreground">Semua paket bisa diganti kapan saja setelah kamu mendaftar.</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan, i) => (
                <div
                  key={plan.tier}
                  className={`rk-reveal relative flex flex-col rounded-lg border-2 p-6 ${
                    plan.dark
                      ? "border-border bg-primary text-primary-foreground"
                      : plan.highlight
                        ? "border-secondary bg-card shadow-brutal"
                        : "border-border bg-card"
                  }`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border-2 border-border bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground">
                      <Star className="size-3 fill-current" /> Paling Populer
                    </span>
                  )}
                  {plan.tier === "TRIAL" && (
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold">{plan.name}</span>
                      <span className="rounded-md border-2 border-border bg-block-green px-2 py-0.5 text-[11px] font-bold">
                        14 Hari
                      </span>
                    </div>
                  )}
                  {plan.tier !== "TRIAL" && <span className="font-display font-bold">{plan.name}</span>}
                  <p className="font-display mt-3 text-3xl font-extrabold">
                    {plan.priceLabel}
                    {plan.price > 0 && (
                      <span className={`text-sm font-medium ${plan.dark ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        /bulan
                      </span>
                    )}
                  </p>
                  <p className={`text-xs ${plan.dark ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{plan.tagline}</p>
                  <ul className={`mt-5 flex-1 space-y-2 text-sm ${plan.dark ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {planFeatures(plan.tier).map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className={`size-3.5 ${plan.dark ? "text-accent" : "text-success"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/register?tier=${plan.tier}`}
                    className={`press-scale mt-6 flex items-center justify-center rounded-md border-2 py-2.5 text-sm font-semibold ${
                      plan.dark
                        ? "border-primary-foreground/30 bg-secondary"
                        : plan.highlight
                          ? "border-border bg-accent text-accent-foreground shadow-brutal-sm"
                          : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ Testimoni ============ */}
        <section id="testimoni" className="mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-16 md:px-8 sm:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Dipercaya pemilik usaha di seluruh Indonesia
            </h2>
            <p className="mt-3 text-muted-foreground">Cerita langsung dari pemilik UMKM yang sudah pakai RapiKasir.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={t.name}
                className="rk-reveal flex flex-col rounded-lg border-2 border-border bg-card p-6 shadow-brutal-sm"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <Quote className="size-6 text-accent" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border font-display font-bold ${t.initialBg}`}>
                    {t.initial}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ============ CTA akhir ============ */}
        <section className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8 sm:pb-24">
          <div className="rk-reveal overflow-hidden rounded-lg border-2 border-border bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Siap bikin usahamu lebih rapi?</h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/75">
              Gratis selamanya untuk paket dasar. Tidak perlu kartu kredit untuk mulai.
            </p>
            <Link
              to="/register"
              className="press-scale mt-7 inline-flex items-center gap-2 rounded-md border-2 border-border bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-brutal-amber"
            >
              Coba Gratis Sekarang <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ============ Footer ============ */}
      <footer className="border-t-2 border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 md:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground">
                <Store className="size-4" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">RapiKasir</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">Aplikasi kasir dan manajemen usaha untuk UMKM Indonesia.</p>
            <p className="mt-4 text-xs text-muted-foreground">© 2026 RapiKasir. Dibuat untuk UMKM Indonesia.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="#fitur" className="font-medium text-foreground/70 hover:text-foreground">Fitur</a>
            <a href="#harga" className="font-medium text-foreground/70 hover:text-foreground">Harga</a>
            <a href="#testimoni" className="font-medium text-foreground/70 hover:text-foreground">Testimoni</a>
            <Link to="/login" className="font-medium text-foreground/70 hover:text-foreground">Masuk</Link>
            <Link to="/register" className="font-semibold text-secondary hover:underline">Daftar Gratis</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Short feature bullets per tier for the pricing cards (mirrors the static landing copy). */
function planFeatures(tier: string): string[] {
  switch (tier) {
    case "FREE":
      return ["30 produk", "100 transaksi/bulan", "Pencatatan kasir dasar", "1 pengguna"];
    case "TRIAL":
      return ["Semua fitur Pro", "500 produk", "Transaksi tanpa batas", "Otomatis ke Free setelah 14 hari"];
    case "PRO":
      return ["500 produk", "Transaksi tanpa batas", "Laporan laba lengkap", "Diskon transaksi"];
    case "BUSINESS":
      return ["Produk tanpa batas", "Multi-cabang", "QRIS & multi-user", "Dukungan prioritas"];
    default:
      return [];
  }
}
