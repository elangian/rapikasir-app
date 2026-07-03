import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTier, type Tier, TIER_LABEL } from "../../context/tier-context";
import { useAuth } from "../../context/auth-context";
import { STORE_NAME, OWNER_NAME, LOW_STOCK } from "../../data/mock-data";

const TIERS: Tier[] = ["FREE", "TRIAL", "PRO", "BUSINESS"];

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { tier, setTier } = useTier();
  const { store, logout } = useAuth();
  const navigate = useNavigate();
  const displayStore = store?.name || STORE_NAME;
  const displayOwner = store?.ownerName || OWNER_NAME;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b-2 border-border bg-background/95 px-3 backdrop-blur sm:gap-3 sm:px-4 md:px-6">
      {/* Hamburger — mobile/tablet only */}
      <button
        onClick={onMenuClick}
        aria-label="Buka menu"
        className="press-scale flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-border bg-card lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Store selector */}
      <button className="press-scale hidden items-center gap-2 rounded-md border-2 border-border bg-card px-3 py-1.5 text-sm font-semibold shadow-brutal-sm sm:flex">
        {displayStore}
        <ChevronDown className="size-4" />
      </button>

      {/* Search */}
      <div className="relative min-w-0 flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari produk…"
          className="h-9 border-2 border-border bg-card pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Demo tier switcher — desktop only (mobile lives in the drawer) */}
        <div className="hidden items-center gap-2 rounded-md border-2 border-dashed border-border bg-block-amber px-2 py-1 lg:flex">
          <span className="text-xs font-semibold text-foreground/70">Demo Paket</span>
          <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
            <SelectTrigger className="h-7 w-[130px] border-2 border-border bg-card text-xs font-semibold">
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

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="press-scale relative flex size-9 items-center justify-center rounded-md border-2 border-border bg-card">
              <Bell className="size-4" />
              {LOW_STOCK.length > 0 && (
                <span className="animate-rk-pulse absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border-2 border-border bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {LOW_STOCK.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 border-2 border-border">
            <DropdownMenuLabel>Stok Menipis</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LOW_STOCK.map((p) => (
              <DropdownMenuItem key={p.id} className="flex justify-between gap-2">
                <span className="truncate">{p.name}</span>
                <span className="font-semibold text-destructive">{p.stock}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-card px-1.5 py-1">
              <span className="flex size-7 items-center justify-center rounded-md border-2 border-border bg-block-amber text-sm font-bold">
                {displayOwner.charAt(0)}
              </span>
              <ChevronDown className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 border-2 border-border">
            <DropdownMenuLabel className="flex flex-col">
              <span>{displayOwner}</span>
              <span className="text-xs font-normal text-muted-foreground">{displayStore}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil Toko</DropdownMenuItem>
            <DropdownMenuItem>Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
