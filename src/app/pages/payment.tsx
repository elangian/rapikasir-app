import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Check, Copy, Timer, Clock, CheckCircle2, XCircle, Wallet, Landmark, Loader2 } from "lucide-react";
import { useTier, type Tier } from "../context/tier-context";
import { EWALLET_METHODS, BANK_METHODS } from "../data/mock-data";
import { formatIDR } from "../lib/format";
import { toast } from "sonner";

const CHECKOUT_PLANS: Record<"PRO" | "BUSINESS", { name: string; tagline: string; price: number; features: string[] }> = {
  PRO: { name: "Paket Pro", tagline: "Untuk UMKM aktif", price: 25000, features: ["500 produk", "Transaksi tanpa batas", "Laporan laba lengkap", "Diskon transaksi"] },
  BUSINESS: { name: "Paket Business", tagline: "Untuk UMKM berkembang", price: 75000, features: ["Produk tanpa batas", "Multi-cabang", "QRIS & multi-user", "Dukungan prioritas"] },
};

type PaymentStatus = "pending" | "success" | "failed";

const STATUS_META: Record<PaymentStatus, { label: string; icon: typeof Clock; classes: string }> = {
  pending: { label: "Menunggu Pembayaran", icon: Clock, classes: "bg-block-amber" },
  success: { label: "Pembayaran Berhasil", icon: CheckCircle2, classes: "bg-block-green text-success" },
  failed: { label: "Pembayaran Gagal", icon: XCircle, classes: "border-destructive/40 text-destructive" },
};

export function Payment() {
  const navigate = useNavigate();
  const { setTier } = useTier();
  const [searchParams] = useSearchParams();

  const initialPlan = (searchParams.get("plan") || "PRO").toUpperCase();
  const [plan, setPlan] = useState<"PRO" | "BUSINESS">(initialPlan === "BUSINESS" ? "BUSINESS" : "PRO");
  const [methodType, setMethodType] = useState<"ewallet" | "bank" | null>(null);
  const [methodLabel, setMethodLabel] = useState("");
  const [qrCells] = useState(() => Array.from({ length: 25 }, () => Math.random() > 0.55));
  const [remaining, setRemaining] = useState(24 * 60 * 60);
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [confirming, setConfirming] = useState(false);

  const current = CHECKOUT_PLANS[plan];

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(() => {
    const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
    const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [remaining]);

  const chooseMethod = (type: "ewallet" | "bank", label: string) => {
    setMethodType(type);
    setMethodLabel(label);
  };

  const copyVA = () => {
    navigator.clipboard?.writeText("880880172026034").catch(() => {});
    toast.success("Nomor VA disalin");
  };

  const confirmPayment = () => {
    setConfirming(true);
    setTimeout(() => {
      setStatus("success");
      setConfirming(false);
      setTier(plan as Tier);
      toast.success(`Paket ${current.name} aktif`, {
        description: "Pembayaran terkonfirmasi. Fitur di seluruh aplikasi sudah ter-upgrade.",
      });
    }, 1200);
  };

  const StatusIcon = STATUS_META[status].icon;

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-20 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-5 md:px-8">
          <button
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="press-scale flex size-9 items-center justify-center rounded-md border-2 border-border bg-card"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="font-display text-base font-bold leading-none">Upgrade Paket</h1>
            <p className="text-xs text-muted-foreground">Buka fitur lebih lengkap untuk tokomu</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 pb-24 md:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Plan toggle */}
          <div className="grid grid-cols-2 gap-3" role="tablist">
            {(["PRO", "BUSINESS"] as const).map((p) => {
              const active = plan === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  aria-selected={active}
                  className={`press-scale rounded-md border-2 p-4 text-left transition-all duration-150 ${
                    active ? "border-primary bg-block-green shadow-brutal-sm" : "border-border bg-card"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-display font-bold">{CHECKOUT_PLANS[p].name.replace("Paket ", "")}</span>
                    <span className="flex size-5 items-center justify-center rounded-full border-2 border-border bg-background">
                      <Check className={`size-3 ${active ? "opacity-100" : "opacity-0"}`} />
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{formatIDR(CHECKOUT_PLANS[p].price)} / bulan</span>
                </button>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="rounded-lg border-2 border-border bg-card p-5 shadow-brutal-sm">
            <p className="text-sm font-medium text-muted-foreground">Ringkasan Paket</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="font-display text-2xl font-bold">{current.name}</p>
                <p className="text-sm text-muted-foreground">{current.tagline}</p>
              </div>
              <p className="font-display tnum text-3xl font-extrabold text-primary">{formatIDR(current.price)}</p>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {current.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="size-3 text-success" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment method */}
          <div>
            <p className="font-display text-base font-semibold">Pilih Metode Pembayaran</p>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">E-wallet</p>
            <div className="grid grid-cols-3 gap-2.5">
              {EWALLET_METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => chooseMethod("ewallet", m.label)}
                  className={`press-scale flex flex-col items-center gap-1.5 rounded-md border-2 px-2 py-3 text-xs font-semibold transition-all duration-150 hover:bg-block-amber ${
                    methodType === "ewallet" && methodLabel === m.label ? "border-primary bg-block-green shadow-brutal-sm" : "border-border bg-card"
                  }`}
                >
                  <Wallet className="size-4" /> {m.label}
                </button>
              ))}
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transfer Bank</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {BANK_METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => chooseMethod("bank", m.label)}
                  className={`press-scale flex flex-col items-center gap-1.5 rounded-md border-2 px-2 py-3 text-xs font-semibold transition-all duration-150 hover:bg-block-amber ${
                    methodType === "bank" && methodLabel === m.label ? "border-primary bg-block-green shadow-brutal-sm" : "border-border bg-card"
                  }`}
                >
                  <Landmark className="size-4" /> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          {methodType && (
            <div className="rk-rise space-y-4">
              <div className="rounded-lg border-2 border-border bg-card p-5 shadow-brutal-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-base font-semibold">Instruksi Pembayaran</p>
                  <span className="rounded-md border-2 border-border bg-block-green px-2 py-0.5 text-xs font-semibold">{methodLabel}</span>
                </div>

                {methodType === "bank" && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Nomor Virtual Account</p>
                    <div className="mt-1 flex items-center justify-between gap-3 rounded-md border-2 border-dashed border-border bg-block-amber px-3 py-2.5">
                      <span className="font-display tnum text-lg font-bold tracking-wide">8808 8017 2026 034</span>
                      <button
                        type="button"
                        onClick={copyVA}
                        className="press-scale flex items-center gap-1.5 rounded-md border-2 border-border bg-card px-2.5 py-1 text-xs font-semibold"
                      >
                        <Copy className="size-3.5" /> Salin
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Atas nama: <span className="font-semibold text-foreground">PT RapiKasir Teknologi Indonesia</span>
                    </p>

                    <ol className="mt-4 space-y-2 text-sm">
                      {[
                        "Buka aplikasi mobile banking atau ATM.",
                        "Pilih menu Transfer ke Virtual Account.",
                        "Masukkan nomor Virtual Account di atas.",
                        "Periksa jumlah tagihan, lalu selesaikan pembayaran.",
                      ].map((step, i) => (
                        <li key={step} className="flex gap-2.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-[11px] font-bold">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {methodType === "ewallet" && (
                  <div className="mt-4">
                    <div className="flex flex-col items-center gap-3 rounded-md border-2 border-dashed border-border bg-block-amber px-4 py-5 sm:flex-row sm:items-start">
                      <div className="grid size-28 shrink-0 grid-cols-5 gap-0.5 rounded-md border-2 border-border bg-card p-2" aria-hidden="true">
                        {qrCells.map((filled, i) => (
                          <div key={i} className={`rounded-[1px] ${filled ? "bg-foreground" : "bg-transparent"}`} />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Pindai kode QR dengan aplikasi <span>{methodLabel}</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Atau buka aplikasi, pilih Bayar / Scan, lalu arahkan kamera ke kode QR ini.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t-2 border-dashed border-border pt-4">
                  <span className="text-sm font-medium">Total Pembayaran</span>
                  <span className="font-display tnum text-xl font-extrabold text-primary">{formatIDR(current.price)}</span>
                </div>
              </div>

              {/* Countdown + confirm */}
              <div className="rounded-lg border-2 border-border bg-primary p-5 text-primary-foreground shadow-brutal">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-primary-foreground/70">Selesaikan pembayaran dalam</p>
                    <p className="font-display tnum text-3xl font-extrabold">{countdown}</p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-primary-foreground/30 bg-secondary">
                    <Timer className="size-5" />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={confirmPayment}
                  disabled={confirming || status === "success"}
                  className={`press-scale mt-4 flex w-full items-center justify-center gap-2 rounded-md border-2 border-border py-3 text-sm font-semibold shadow-brutal-sm disabled:opacity-90 ${
                    status === "success" ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"
                  }`}
                >
                  {confirming ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Memeriksa pembayaran…
                    </>
                  ) : status === "success" ? (
                    <>
                      <Check className="size-4" /> Pembayaran Terkonfirmasi
                    </>
                  ) : (
                    "Saya Sudah Bayar"
                  )}
                </button>
              </div>

              {/* Status */}
              <div className="rounded-lg border-2 border-border bg-card p-5">
                <p className="text-sm font-medium text-muted-foreground">Status Pembayaran</p>
                <div className={`mt-2 flex items-center gap-2 rounded-md border-2 border-border px-3 py-2.5 ${STATUS_META[status].classes}`}>
                  <StatusIcon className="size-4" />
                  <span className="text-sm font-semibold">{STATUS_META[status].label}</span>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-md border-2 border-dashed border-border bg-block-amber/40 px-2.5 py-2">
                  <span className="text-[11px] font-semibold text-foreground/70">Pratinjau status</span>
                  <div className="ml-auto flex gap-1.5">
                    {(["pending", "success", "failed"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className="press-scale rounded-md border-2 border-border bg-card px-2 py-1 text-[11px] font-semibold"
                      >
                        {s === "pending" ? "Pending" : s === "success" ? "Sukses" : "Gagal"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
