import { useState, type FormEvent, type ReactNode } from "react";
import { Store, Lock, ArrowRight, AlertCircle } from "lucide-react";

const SESSION_KEY = "rapikasir.admin.unlocked";

/**
 * Lightweight client-side gate for the internal /admin/* tool.
 *
 * This is NOT real authentication — it's a passphrase check against a
 * build-time env var, meant only to stop casual/accidental access to the
 * admin tool once the app is deployed publicly. Anyone who inspects the
 * bundle can technically find the passphrase, so never reuse it as a
 * real password and never treat this as sufficient protection for actual
 * production data.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const expected = import.meta.env.VITE_ADMIN_PASSPHRASE as string | undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!expected) {
      // Fails closed: if the env var isn't configured, admin stays locked
      // rather than silently allowing anyone in.
      setError(true);
      return;
    }
    if (input === expected) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-5 font-sans text-admin-foreground antialiased">
      <div className="w-full max-w-sm rounded-lg border-2 border-admin-border bg-admin-surface p-8 shadow-brutal">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-accent text-accent-foreground">
            <Store className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">RapiKasir Internal</span>
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-admin-foreground/70">
          <Lock className="size-4" /> Masukkan kode akses buat masuk ke tool internal.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {expected ? "Kode salah, coba lagi." : "VITE_ADMIN_PASSPHRASE belum di-set di .env.local / Vercel."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Kode akses"
            className="h-11 w-full rounded-md border-2 border-admin-border bg-admin-bg px-3 text-base text-admin-foreground placeholder:text-admin-foreground/45"
          />
          <button
            type="submit"
            className="press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-brutal-sm"
          >
            Masuk <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
