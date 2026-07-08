import { useMemo } from "react";
import { TrendingUp, UserPlus, Receipt, Calendar, Trash2 } from "lucide-react";
import { AdminLayout } from "../../components/layout/admin-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { formatIDR } from "../../lib/format";
import { useSessionState } from "../../lib/use-session-state";
import { toast } from "sonner";

const MOCK_STATS = {
  mrr: 38_500_000,
  mrrTrendPct: 9.2,
  proCount: 892,
  businessCount: 216,
  newUsersToday: 47,
  newUsersTrend: 12,
  subsToday: 18,
  subsAmountToday: 650_000,
  freeCount: 6480,
  totalActive: 7588,
};

const EMPTY_STATS = {
  mrr: 0,
  mrrTrendPct: 0,
  proCount: 0,
  businessCount: 0,
  newUsersToday: 0,
  newUsersTrend: 0,
  subsToday: 0,
  subsAmountToday: 0,
  freeCount: 0,
  totalActive: 0,
};

export function AdminDashboard() {
  const [cleared, setCleared] = useSessionState("rapikasir.admin-dashboard.cleared", false);
  const stats = cleared ? EMPTY_STATS : MOCK_STATS;
  const { linePath, areaPath } = useMemo(() => buildGrowthPath(cleared), [cleared]);

  return (
    <AdminLayout
      pageTitle="Dashboard Admin"
      pageSubtitle="Ringkasan performa platform (data contoh)"
      headerAction={
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-md border-2 border-admin-border px-2.5 py-1 text-xs font-medium text-admin-foreground/70 sm:flex">
            <Calendar className="size-3.5" /> Kamis, 2 Juli 2026
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={cleared}
                className="press-scale flex items-center gap-2 rounded-md border-2 border-destructive/50 bg-admin-bg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-3.5" /> Hapus Semua
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-2 border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset dashboard admin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ini cuma data contoh (mock) di sesi browser ini — bukan angka platform asli, jadi refresh halaman
                  akan mengembalikannya seperti semula.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setCleared(true);
                    toast.success("Dashboard admin direset", { description: "Sesi ini saja — refresh untuk kembali ke contoh semula." });
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Ya, Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* MRR hero */}
        <div className="flex flex-col rounded-md border-2 border-accent bg-admin-surface p-5 shadow-brutal-amber sm:col-span-2">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-admin-foreground/70">Monthly Recurring Revenue</span>
            {stats.mrr > 0 && (
              <span className="flex items-center gap-1 rounded-md border-2 border-border bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                <TrendingUp className="size-3" /> +{stats.mrrTrendPct.toLocaleString("id-ID")}%
              </span>
            )}
          </div>
          <p className="font-display tnum mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">{formatIDR(stats.mrr)}</p>
          <p className="mt-1 text-xs text-admin-foreground/55">
            {stats.proCount} Pro &middot; {stats.businessCount} Business &middot; vs bulan lalu
          </p>
        </div>

        {/* New users today */}
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-admin-border bg-admin-bg">
            <UserPlus className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-admin-foreground/70">User Baru Hari Ini</p>
          <p className="font-display tnum text-3xl font-extrabold">{stats.newUsersToday}</p>
          {stats.newUsersTrend > 0 && (
            <p className="mt-auto flex items-center gap-1 pt-2 text-xs font-semibold text-accent">
              <TrendingUp className="size-3" />+{stats.newUsersTrend} dari kemarin
            </p>
          )}
        </div>

        {/* Subscription transactions today */}
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-admin-border bg-admin-bg">
            <Receipt className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-admin-foreground/70">Transaksi Subscription</p>
          <p className="font-display tnum text-3xl font-extrabold">{stats.subsToday}</p>
          <p className="tnum mt-auto pt-2 text-xs text-admin-foreground/55">{formatIDR(stats.subsAmountToday)} masuk hari ini</p>
        </div>

        {/* Tier breakdown */}
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Paket Free</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold">{stats.freeCount.toLocaleString("id-ID")}</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">user aktif</p>
        </div>
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Paket Pro</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold">{stats.proCount.toLocaleString("id-ID")}</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">user aktif</p>
        </div>
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Paket Business</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold">{stats.businessCount.toLocaleString("id-ID")}</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">user aktif</p>
        </div>
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-bg p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Total User Aktif</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold text-accent">{stats.totalActive.toLocaleString("id-ID")}</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">Free + Pro + Business</p>
        </div>

        {/* Growth chart */}
        <div className="rounded-md border-2 border-admin-border bg-admin-surface p-5 sm:col-span-2 lg:col-span-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold">Pertumbuhan User (30 Hari Terakhir)</span>
            <span className="text-xs text-admin-foreground/55">3 Jun s.d. 2 Jul 2026</span>
          </div>
          <div className="mt-4 h-52">
            {cleared ? (
              <div className="flex h-full items-center justify-center text-sm text-admin-foreground/55">
                Data direset — refresh halaman untuk melihat contoh lagi.
              </div>
            ) : (
              <svg
                viewBox="0 0 1000 200"
                className="h-full w-full"
                preserveAspectRatio="none"
                role="img"
                aria-label="Grafik pertumbuhan user 30 hari, dari 5.900 menuju 7.588 user"
              >
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5A623" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#growthFill)" />
                <path d={linePath} fill="none" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/** Deterministic 30-day "organic" growth curve, hand-rolled SVG paths (mirrors the static prototype's inline chart). */
function buildGrowthPath(cleared: boolean) {
  if (cleared) return { linePath: "", areaPath: "" };
  const days = 30;
  const w = 1000;
  const h = 200;
  const pad = 8;
  const start = 5900;
  const end = 7588;
  const pts: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    const base = start + (end - start) * t;
    const wiggle = Math.sin(i * 0.9) * 60 + Math.sin(i * 0.35) * 90;
    pts.push(Math.max(start - 100, base + wiggle));
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const x = (i: number) => pad + (i / (days - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const linePath = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${x(days - 1).toFixed(1)} ${h} L ${x(0).toFixed(1)} ${h} Z`;
  return { linePath, areaPath };
}
