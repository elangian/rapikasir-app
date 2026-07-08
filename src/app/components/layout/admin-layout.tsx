import { useState, type ReactNode } from "react";
import { NavLink, Link } from "react-router";
import { LayoutDashboard, Users, CreditCard, Menu, X, LogOut } from "lucide-react";
import { cn } from "../ui/utils";
import { MobileDrawer } from "../shared/mobile-drawer";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Manajemen User", icon: Users },
  { to: "/admin/subscriptions", label: "Monitor Subscription", icon: CreditCard },
];

function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-2">
      {ADMIN_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md border-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-border bg-accent text-accent-foreground"
                : "border-transparent text-admin-foreground/80 hover:bg-admin-surface hover:text-admin-foreground",
            )
          }
        >
          <item.icon className="size-5 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function AdminBrand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b-2 border-admin-border px-4">
      <img src="/logo-icon.png" alt="RapiKasir" className="size-8 shrink-0" />
      <span className="font-display text-base font-bold tracking-tight">RapiKasir</span>
      <span className="ml-auto rounded-md border border-admin-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-foreground/60">
        Internal
      </span>
    </div>
  );
}

function AdminFooter() {
  return (
    <div className="border-t-2 border-admin-border p-3">
      <div className="flex items-center gap-2 rounded-md px-1 py-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-border bg-accent text-sm font-bold text-accent-foreground">
          R
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Reza Firmansyah</p>
          <p className="truncate text-xs text-admin-foreground/55">Ops &amp; Growth Team</p>
        </div>
      </div>
      <Link
        to="/"
        className="press-scale mt-2 flex w-full items-center justify-center gap-2 rounded-md border-2 border-admin-border py-1.5 text-xs font-medium text-admin-foreground/75 hover:bg-admin-surface"
      >
        <LogOut className="size-3.5" /> Keluar
      </Link>
    </div>
  );
}

export function AdminLayout({
  pageTitle,
  pageSubtitle,
  headerAction,
  children,
}: {
  pageTitle: string;
  pageSubtitle: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-scope min-h-screen bg-admin-bg font-sans text-admin-foreground antialiased">
      <div className="flex min-h-screen w-full">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r-2 border-admin-border bg-admin-bg lg:flex">
          <AdminBrand />
          <AdminNavLinks />
          <AdminFooter />
        </aside>

        {/* Mobile drawer */}
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Menu navigasi admin">
          <div className="flex h-full flex-col bg-admin-bg text-admin-foreground">
            <div className="flex h-16 items-center gap-2 border-b-2 border-admin-border px-4">
              <img src="/logo-icon.png" alt="RapiKasir" className="size-8" />
              <span className="font-display text-base font-bold">RapiKasir</span>
              <button onClick={() => setMobileOpen(false)} className="ml-auto text-admin-foreground/70" aria-label="Tutup menu">
                <X className="size-5" />
              </button>
            </div>
            <AdminNavLinks onNavigate={() => setMobileOpen(false)} />
            <AdminFooter />
          </div>
        </MobileDrawer>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b-2 border-admin-border bg-admin-bg/95 px-4 backdrop-blur md:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              className="press-scale flex size-9 items-center justify-center rounded-md border-2 border-admin-border lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div>
              <h1 className="font-display text-base font-bold leading-none">{pageTitle}</h1>
              <p className="text-xs text-admin-foreground/55">{pageSubtitle}</p>
            </div>
            {headerAction && <div className="ml-auto">{headerAction}</div>}
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
