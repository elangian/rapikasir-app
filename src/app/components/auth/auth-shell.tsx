import { Link } from "react-router";
import { type LucideIcon } from "lucide-react";

interface BrandPoint {
  icon: LucideIcon;
  text: string;
}

/**
 * Split layout used by the Login screen: forest-green brand panel on the
 * left (lg+ only), form card on the right. Register/Onboarding use a
 * simpler centered-card layout instead (see their own page files).
 */
export function AuthShell({
  points,
  headline,
  children,
}: {
  points: BrandPoint[];
  headline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background font-sans antialiased lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
          <div className="absolute -right-16 top-24 h-64 w-64 rotate-6 rounded-lg border-2 border-secondary-foreground" />
          <div className="absolute -right-6 top-56 h-40 w-40 -rotate-3 rounded-lg border-2 border-accent" />
          <div className="absolute right-40 -bottom-10 h-52 w-52 rotate-12 rounded-lg border-2 border-secondary-foreground" />
        </div>

        <Link to="/" className="relative flex items-center gap-2.5">
          <img src="/logo-icon.png" alt="RapiKasir" className="size-9" />
          <span className="font-display text-xl font-bold tracking-tight text-primary-foreground">RapiKasir</span>
        </Link>

        <div className="relative max-w-sm">
          <p className="font-display text-3xl font-bold leading-snug text-primary-foreground xl:text-4xl">{headline}</p>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border-2 border-secondary-foreground/30 bg-secondary text-primary-foreground">
                  <p.icon className="size-3.5" />
                </span>
                <span className="text-sm text-primary-foreground/80">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/50">© 2026 RapiKasir. Dibuat untuk UMKM Indonesia.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/logo-icon.png" alt="RapiKasir" className="size-9" />
            <span className="font-display text-xl font-bold tracking-tight">RapiKasir</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
