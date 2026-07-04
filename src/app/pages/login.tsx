import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Users, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { AuthShell } from "../components/auth/auth-shell";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

 const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatus("loading");
    try {
      await login({ email, password });
      setStatus("done");
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setStatus("idle");
      setErrorMsg(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
    }
  };
  return (
    <AuthShell
      headline="Semua transaksi tokomu, rapi dalam satu tempat."
      points={[
        { icon: ShieldCheck, text: "Data transaksi tersimpan aman dan bisa diakses kapan saja." },
        { icon: Users, text: "Dipakai lebih dari 8.400 UMKM di seluruh Indonesia." },
        { icon: Zap, text: "Setup toko selesai dalam kurang dari 5 menit." },
      ]}
    >
      <div className="rounded-lg border-2 border-border bg-card p-6 shadow-brutal sm:p-8">
        {status === "done" ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-md border-2 border-border bg-block-green text-success">
              <CheckCircle2 className="size-6" />
            </span>
            <h2 className="font-display mt-4 text-xl font-bold">Berhasil masuk</h2>
            <p className="mt-1.5 max-w-[26ch] text-sm text-muted-foreground">Mengarahkan ke Dashboard…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold tracking-tight">Masuk ke RapiKasir</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Kelola transaksi dan lihat performa tokomu.</p>

            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {errorMsg}
              </div>
            )}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">Kata Sandi</label>
                  <a href="#lupa-password" className="text-xs font-semibold text-secondary hover:underline">Lupa password?</a>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
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

              <button
                type="submit"
                disabled={status === "loading"}
                className="press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-brutal-sm disabled:opacity-70"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Memproses…
                  </>
                ) : (
                  <>
                    Masuk <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link to="/register" className="font-semibold text-secondary hover:underline">Daftar sekarang</Link>
      </p>
    </AuthShell>
  );
}
