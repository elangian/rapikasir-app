import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check, Star, AlertCircle } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { PLANS } from "../data/mock-data";
import type { Tier } from "../context/tier-context";

const REGISTER_TIERS: Tier[] = ["FREE", "PRO", "BUSINESS"];

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

  const initialTier = (searchParams.get("tier") || "FREE").toUpperCase();
  const [tier, setTier] = useState<Tier>(
    REGISTER_TIERS.includes(initialTier as Tier) ? (initialTier as Tier) : "FREE",
  );
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

 const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await register({ storeName, email, password, tier });
      navigate("/onboarding");
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err instanceof Error ? err.message : "Registrasi gagal. Coba lagi.");
    }
  };

  const plans = PLANS.filter((p) => REGISTER_TIERS.includes(p.tier));

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="mx-auto flex h-20 w-full max-w-7xl items-center px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground">
            <Store className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">RapiKasir</span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-2 md:px-8 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border-2 border-border bg-card p-6 shadow-brutal sm:p-8 md:p-10">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Daftar RapiKasir</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Mulai gratis, tanpa kartu kredit. Upgrade kapan saja.</p>
            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form className="mt-7 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="h-11 w-full rounded-md border-2 border-border bg-card pl-10 pr-3 text-base placeholder:text-muted-foreground/70"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="h-11 w-full rounded-md border-2 border-border bg-card pl-10 pr-11 text-base placeholder:text-muted-foreground/70"
                      />
                      <button
                        type="button"
                        aria-label="Tampilkan kata sandi"
                        onClick={() => setShowPassword((s) => !s)}
                        className="press-scale absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-border pt-6">
                <p className="font-display text-base font-semibold">Pilih paket kamu</p>
                <p className="text-sm text-muted-foreground">Bisa diganti kapan saja lewat halaman Paket & Upgrade.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {plans.map((plan) => {
                    const active = tier === plan.tier;
                    return (
                      <label key={plan.tier} className="group relative cursor-pointer">
                        <input
                          type="radio"
                          name="tier"
                          value={plan.tier}
                          checked={active}
                          onChange={() => setTier(plan.tier)}
                          className="peer sr-only"
                        />
                        {plan.highlight && (
                          <span className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-md border-2 border-border bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground">
                            <Star className="size-3 fill-current" /> Populer
                          </span>
                        )}
                        <div
                          className={`flex h-full flex-col rounded-md border-2 p-4 transition-all duration-150 ${
                            active ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
                          } ${
                            plan.dark
                              ? "border-border bg-primary text-primary-foreground"
                              : plan.highlight
                                ? "border-secondary bg-card shadow-brutal-sm"
                                : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold">{plan.name}</span>
                            <span
                              className={`flex size-5 items-center justify-center rounded-full border-2 bg-background ${
                                plan.dark ? "border-primary-foreground/40 bg-primary" : "border-border"
                              }`}
                            >
                              <Check className={`size-3 ${active ? "opacity-100" : "opacity-0"} ${plan.dark ? "text-primary-foreground" : ""}`} />
                            </span>
                          </div>
                          <p className="font-display mt-2 text-2xl font-extrabold">
                            {plan.priceLabel === "Rp 0" ? "Rp 0" : (
                              <>
                                {plan.priceLabel.replace(".000", "")}
                                <span className="text-base font-bold">rb</span>
                              </>
                            )}
                          </p>
                          <p className={`text-xs ${plan.dark ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{plan.tagline}</p>
                          <ul className={`mt-3 space-y-1.5 text-xs ${plan.dark ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {registerPlanFeatures(plan.tier).map((f) => (
                              <li key={f} className="flex items-center gap-1.5">
                                <Check className={`size-3 ${plan.dark ? "text-accent" : "text-success"}`} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-brutal-sm disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Membuat akun…
                  </>
                ) : (
                  <>
                    Daftar Sekarang <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-secondary hover:underline">Masuk</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function registerPlanFeatures(tier: Tier): string[] {
  switch (tier) {
    case "FREE":
      return ["30 produk", "100 transaksi/bulan", "Pencatatan kasir dasar"];
    case "PRO":
      return ["500 produk", "Transaksi tanpa batas", "Laporan laba lengkap"];
    case "BUSINESS":
      return ["Produk tanpa batas", "Multi-cabang", "QRIS & multi-user"];
    default:
      return [];
  }
}
