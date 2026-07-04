import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Store,
  Check,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Loader2,
  UtensilsCrossed,
  Coffee,
  ShoppingBasket,
  Shirt,
  PencilRuler,
  ShoppingBag,
  Wrench,
  Ellipsis,
  Package,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useTier, TIER_LABEL } from "../context/tier-context";
import { STORE_CATEGORIES, PRODUCT_QTY_OPTIONS } from "../data/mock-data";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "utensils-crossed": UtensilsCrossed,
  coffee: Coffee,
  "shopping-basket": ShoppingBasket,
  shirt: Shirt,
  "pencil-ruler": PencilRuler,
  "shopping-bag": ShoppingBag,
  wrench: Wrench,
  ellipsis: Ellipsis,
};

const STEPS = [
  { n: 1, label: "Profil Toko" },
  { n: 2, label: "Estimasi Produk" },
  { n: 3, label: "Konfirmasi" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { tier } = useTier();

  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState(user?.name || "");
  const [category, setCategory] = useState<string | null>(null);
  const [qty, setQty] = useState<string | null>(null);
  const [pulseCategory, setPulseCategory] = useState(false);
  const [pulseQty, setPulseQty] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const categoryLabel = STORE_CATEGORIES.find((c) => c.key === category)?.label ?? "-";
  const qtyLabel = PRODUCT_QTY_OPTIONS.find((q) => q.key === qty)?.label ?? "-";

  const goNext = () => {
    if (step === 1) {
      if (!storeName.trim() || !category) {
        if (!category) {
          setPulseCategory(true);
          setTimeout(() => setPulseCategory(false), 800);
        }
        return;
      }
    }
    if (step === 2 && !qty) {
      setPulseQty(true);
      setTimeout(() => setPulseQty(false), 800);
      return;
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const finish = async () => {
    setErrorMsg(null);
    setFinishing(true);
    try {
      await completeOnboarding({
        name: storeName.trim() || "Tokomu",
        ownerName: user?.name || "Pemilik Toko",
        category: category || "lainnya",
        categoryLabel,
        productQty: qty || undefined,
      });
      navigate("/");
    } catch (err) {
      setFinishing(false);
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan profil toko. Coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground">
            <Store className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">RapiKasir</span>
        </div>
        <span className="rounded-md border-2 border-border bg-block-green px-2.5 py-1 text-xs font-semibold text-foreground">
          Setup Toko
        </span>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Stepper */}
          <div className="mb-8 flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.n} className="contents">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-border text-sm font-bold ${
                      s.n < step
                        ? "bg-primary text-primary-foreground"
                        : s.n === step
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-muted-foreground"
                    }`}
                  >
                    {s.n < step ? <Check className="size-3.5" /> : s.n}
                  </span>
                  <span className={`hidden text-sm font-semibold sm:inline ${s.n !== step ? "text-muted-foreground" : ""}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={`mx-3 h-0.5 flex-1 ${s.n < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border-2 border-border bg-card p-6 shadow-brutal sm:p-8">
            {step === 1 && (
              <section>
                <h1 className="font-display text-2xl font-bold tracking-tight">Ceritakan tentang tokomu</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Biar tampilan RapiKasir sesuai kebutuhan usahamu.</p>

                <div className="mt-6">
                  <label htmlFor="store-name" className="mb-1.5 block text-sm font-medium">Nama Toko</label>
                  <div className="relative">
                    <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="store-name"
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Contoh: Kedai Kopi Senja"
                      className="h-11 w-full rounded-md border-2 border-border bg-card pl-10 pr-3 text-base placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium">Kategori Usaha</p>
                  <div className={`grid grid-cols-2 gap-2.5 sm:grid-cols-4 ${pulseCategory ? "animate-rk-pulse" : ""}`}>
                    {STORE_CATEGORIES.map((c) => {
                      const Icon = CATEGORY_ICONS[c.icon] ?? Ellipsis;
                      const active = category === c.key;
                      return (
                        <label key={c.key} className="cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={c.key}
                            checked={active}
                            onChange={() => setCategory(c.key)}
                            className="peer sr-only"
                          />
                          <div
                            className={`flex flex-col items-center gap-1.5 rounded-md border-2 px-2 py-3 text-center transition-all duration-150 ${
                              active ? "border-primary bg-block-green shadow-brutal-sm" : "border-border bg-card"
                            }`}
                          >
                            <Icon className="size-5" />
                            <span className="text-xs font-medium leading-tight">{c.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-7 flex justify-end">
                  <button
                    type="button"
                    onClick={goNext}
                    className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-brutal-sm"
                  >
                    Lanjut <ArrowRight className="size-4" />
                  </button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h1 className="font-display text-2xl font-bold tracking-tight">Berapa banyak produk yang akan kamu jual?</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Ini membantu kami menyiapkan katalog awal tokomu.</p>

                <div className={`mt-6 grid gap-2.5 sm:grid-cols-2 ${pulseQty ? "animate-rk-pulse" : ""}`}>
                  {PRODUCT_QTY_OPTIONS.map((q) => {
                    const active = qty === q.key;
                    return (
                      <label key={q.key} className="cursor-pointer">
                        <input
                          type="radio"
                          name="qty"
                          value={q.key}
                          checked={active}
                          onChange={() => setQty(q.key)}
                          className="peer sr-only"
                        />
                        <div
                          className={`flex items-center gap-3 rounded-md border-2 px-4 py-3 transition-all duration-150 ${
                            active ? "border-primary bg-block-green shadow-brutal-sm" : "border-border bg-card"
                          }`}
                        >
                          <Package className="size-4 shrink-0" />
                          <span className="text-sm font-medium">{q.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-card px-5 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="size-4" /> Kembali
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-brutal-sm"
                  >
                    Lanjut <ArrowRight className="size-4" />
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-border bg-block-green text-success">
                    <PartyPopper className="size-5" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Semua sudah siap!</h1>
                    <p className="text-sm text-muted-foreground">Selamat datang, {storeName.trim() || "Tokomu"}!</p>
                  </div>
                </div>

                <dl className="mt-6 divide-y-2 divide-dashed divide-border rounded-md border-2 border-border">
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Nama Toko</dt>
                    <dd className="text-sm font-semibold">{storeName.trim() || "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Kategori Usaha</dt>
                    <dd className="text-sm font-semibold">{categoryLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Estimasi Produk</dt>
                    <dd className="text-sm font-semibold">{qtyLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Paket Aktif</dt>
                    <dd>
                      <span className="rounded-md border-2 border-border bg-block-amber px-2 py-0.5 text-xs font-bold">
                        {TIER_LABEL[tier]}
                      </span>
                    </dd>
                  </div>
                </dl>

                {errorMsg && (
                  <div className="mt-5 flex items-start gap-2 rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}
                <div className="mt-7 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-card px-5 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="size-4" /> Kembali
                  </button>
                  <button
                    type="button"
                    onClick={finish}
                    disabled={finishing}
                    className="press-scale flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-border bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-brutal-sm disabled:opacity-70"
                  >
                    {finishing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Menyiapkan Dashboard…
                      </>
                    ) : (
                      <>
                        Masuk ke Dashboard <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
