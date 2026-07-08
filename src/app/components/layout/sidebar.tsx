import { NavLink, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useTier, TIER_LABEL, type Tier } from "../../context/tier-context";
import { useAuth } from "../../context/auth-context";
import { STORE_NAME, OWNER_NAME } from "../../data/mock-data";
import { ProductLimit } from "../shared/product-limit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transaksi", label: "Transaksi", icon: ShoppingCart },
  { to: "/produk", label: "Produk", icon: Package },
  { to: "/stok", label: "Stok", icon: Boxes },
  { to: "/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
];

const TIERS: Tier[] = ["FREE", "TRIAL", "PRO", "BUSINESS"];

/** Inner sidebar content, shared between the desktop rail and the mobile drawer. */
export function SidebarContent({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const { tier, setTier } = useTier();
  const { store, logout } = useAuth();
  const navigate = useNavigate();
  const displayStore = store?.name || STORE_NAME;
  const displayOwner = store?.ownerName || OWNER_NAME;

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b-2 border-sidebar-border px-4">
        <img src="/logo-icon.png" alt="RapiKasir" className="size-8 shrink-0" />
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight">RapiKasir</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-accent text-accent-foreground border-2 border-border"
                  : "border-2 border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="size-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {/* Upsell anchor */}
        <NavLink
          to="/paket"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "mt-2 flex items-center gap-3 rounded-md border-2 border-border bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground shadow-brutal-sm transition-transform duration-150 hover:-translate-y-0.5",
              isActive && "ring-2 ring-offset-2 ring-offset-sidebar ring-accent",
            )
          }
          title={collapsed ? "Paket & Upgrade" : undefined}
        >
          <Sparkles className="size-5 shrink-0" />
          {!collapsed && <span className="truncate">Paket & Upgrade</span>}
        </NavLink>
      </nav>

      {/* Tier + user footer */}
      <div className="border-t-2 border-sidebar-border p-2">
        {!collapsed && (
          <div className="mb-2 space-y-2 rounded-md border-2 border-sidebar-border bg-sidebar-accent px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-sidebar-foreground/60">Paket</p>
                <p className="truncate text-sm font-semibold">{TIER_LABEL[tier]}</p>
              </div>
              <Link
                to="/paket"
                onClick={onNavigate}
                className="press-scale rounded-md border-2 border-border bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground"
              >
                Upgrade
              </Link>
            </div>
            <ProductLimit variant="sidebar" />

            {/* Demo tier switcher — mobile/tablet only (desktop has it in topbar) */}
            <div className="lg:hidden">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
                Demo Paket
              </p>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger className="h-8 w-full border-2 border-sidebar-border bg-sidebar text-xs font-semibold text-sidebar-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-border">
                  {TIERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIER_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-md px-1 py-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-border bg-block-amber text-sm font-bold text-foreground">
            {displayOwner.charAt(0)}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayStore}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{displayOwner}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? "Keluar" : undefined}
          className="press-scale mt-2 flex w-full items-center justify-center gap-2 rounded-md border-2 border-sidebar-border py-1.5 text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          <LogOut className="size-3.5" />
          {!collapsed && "Keluar"}
        </button>

        {onToggle && (
          <button
            onClick={onToggle}
            className="press-scale mt-2 flex w-full items-center justify-center gap-2 rounded-md border-2 border-sidebar-border py-1.5 text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <ChevronLeft
              className={cn("size-4 transition-transform duration-200", collapsed && "rotate-180")}
            />
            {!collapsed && "Tutup"}
          </button>
        )}
      </div>
    </div>
  );
}

/** Desktop collapsible rail (hidden on mobile — see the drawer in App layout). */
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="sticky top-0 z-30 hidden h-screen shrink-0 flex-col overflow-hidden border-r-2 border-border lg:flex"
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </motion.aside>
  );
}
