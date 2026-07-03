import { useMemo } from "react";
import { TrendingUp, UserPlus, Receipt, Calendar } from "lucide-react";
import { AdminLayout } from "../../components/layout/admin-layout";
import { formatIDR } from "../../lib/format";

export function AdminDashboard() {
  const { linePath, areaPath } = useMemo(() => buildGrowthPath(), []);

  return (
    <AdminLayout
      pageTitle="Dashboard Admin"
      pageSubtitle="Ringkasan performa platform"
      headerAction={
        <span className="hidden items-center gap-1.5 rounded-md border-2 border-admin-border px-2.5 py-1 text-xs font-medium text-admin-foreground/70 sm:flex">
          <Calendar className="size-3.5" /> Kamis, 2 Juli 2026
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* MRR hero */}
        <div className="flex flex-col rounded-md border-2 border-accent bg-admin-surface p-5 shadow-brutal-amber sm:col-span-2">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-admin-foreground/70">Monthly Recurring Revenue</span>
            <span className="flex items-center gap-1 rounded-md border-2 border-border bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
              <TrendingUp className="size-3" /> +9,2%
            </span>
          </div>
          <p className="font-display tnum mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">{formatIDR(38_500_000)}</p>
          <p className="mt-1 text-xs text-admin-foreground/55">892 Pro &middot; 216 Business &middot; vs bulan lalu</p>
        </div>

        {/* New users today */}
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-admin-border bg-admin-bg">
            <UserPlus className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-admin-foreground/70">User Baru Hari Ini</p>
          <p className="font-display tnum text-3xl font-extrabold">47</p>
          <p className="mt-auto flex items-center gap-1 pt-2 text-xs font-semibold text-accent">
            <TrendingUp className="size-3" />+12 dari kemarin
          </p>
        </div>

        {/* Subscription transactions today */}
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-admin-border bg-admin-bg">
            <Receipt className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-admin-foreground/70">Transaksi Subscription</p>
          <p className="font-display tnum text-3xl font-extrabold">18</p>
          <p className="tnum mt-auto pt-2 text-xs text-admin-foreground/55">{formatIDR(650_000)} masuk hari ini</p>
        </div>

        {/* Tier breakdown */}
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Paket Free</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold">6.480</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">user aktif</p>
        </div>
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Paket Pro</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold">892</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">user aktif</p>
        </div>
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-surface p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Paket Business</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold">216</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">user aktif</p>
        </div>
        <div className="flex flex-col rounded-md border-2 border-admin-border bg-admin-bg p-5">
          <span className="text-sm font-medium text-admin-foreground/70">Total User Aktif</span>
          <p className="font-display tnum mt-2 text-2xl font-extrabold text-accent">7.588</p>
          <p className="mt-auto pt-2 text-xs text-admin-foreground/55">Free + Pro + Business</p>
        </div>

        {/* Growth chart */}
        <div className="rounded-md border-2 border-admin-border bg-admin-surface p-5 sm:col-span-2 lg:col-span-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold">Pertumbuhan User (30 Hari Terakhir)</span>
            <span className="text-xs text-admin-foreground/55">3 Jun s.d. 2 Jul 2026</span>
          </div>
          <div className="mt-4 h-52">
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/** Deterministic 30-day "organic" growth curve, hand-rolled SVG paths (mirrors the static prototype's inline chart). */
function buildGrowthPath() {
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
