import type { ComponentType } from "react";
import { Link } from "react-router";
import {
  Lock,
  FileSpreadsheet,
  FileText,
  Wallet,
  Receipt,
  TrendingUp,
  PiggyBank,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import { TierBadge } from "../components/shared/tier-lock";
import { useTier } from "../context/tier-context";
import {
  REPORT_SUMMARY,
  REPORT_TOP_PRODUCTS,
  REVENUE_TREND_30D,
} from "../data/mock-data";
import { formatIDR, formatCompactIDR, formatPercent, formatNumber } from "../lib/format";

export function Laporan() {
  const { tier, canUse } = useTier();
  const locked = !canUse("reports"); // FREE tier
  const canExport = canUse("export");
  const canNet = canUse("netProfit");
  const isBusiness = tier === "BUSINESS";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display">Laporan</h1>
          <p className="text-muted-foreground">
            Ringkasan performa usaha • Periode {REPORT_SUMMARY.periodLabel}
          </p>
        </div>

        {!locked && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-md border-2 border-border bg-card px-2 py-1 sm:flex-none">
              <CalendarDays className="size-4" />
              <Select defaultValue="jun26">
                <SelectTrigger className="h-8 w-full border-0 bg-transparent shadow-none focus-visible:ring-0 sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-border">
                  <SelectItem value="jun26">Juni 2026</SelectItem>
                  <SelectItem value="mei26">Mei 2026</SelectItem>
                  <SelectItem value="apr26">April 2026</SelectItem>
                  {isBusiness && <SelectItem value="custom">Rentang Kustom…</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <ExportButton icon={FileSpreadsheet} label="Excel" enabled={canExport} />
            <ExportButton icon={FileText} label="PDF" enabled={canExport} />
          </div>
        )}
      </div>

      {/* Report body (blurred + overlay when locked) */}
      <div className="relative">
        <div className={cn(locked && "pointer-events-none select-none blur-[6px]")} aria-hidden={locked}>
          <ReportBody canNet={canNet} />
        </div>

        {locked && <LockedOverlay />}
      </div>
    </div>
  );
}

function ReportBody({ canNet }: { canNet: boolean }) {
  const s = REPORT_SUMMARY;
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Wallet}
          tone="amber"
          label="Total Pendapatan"
          value={formatIDR(s.totalRevenue)}
          trend={formatPercent(s.revenueTrendPct)}
        />
        <KpiCard
          icon={Receipt}
          label="Total Transaksi"
          value={formatNumber(s.totalTransactions)}
          trend={formatPercent(s.transactionsTrendPct)}
        />
        <KpiCard
          icon={TrendingUp}
          tone="green"
          label="Laba Kotor"
          value={formatIDR(s.grossProfit)}
          sub={`Margin ${s.grossMarginPct.toLocaleString("id-ID")}%`}
        />
        <KpiCard
          icon={PiggyBank}
          label="Laba Bersih"
          value={canNet ? formatIDR(s.netProfit) : "•••••••"}
          sub={canNet ? `Margin ${s.netMarginPct.toLocaleString("id-ID")}%` : undefined}
          badge={!canNet ? "PRO" : undefined}
        />
      </div>

      {/* Trend chart */}
      <div className="rounded-md border-2 border-border bg-card p-5 shadow-brutal-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-base font-semibold">Tren Pendapatan (30 Hari)</span>
          <Badge className="border-2 border-border bg-block-green text-foreground">
            <TrendingUp className="size-3" /> {formatPercent(REPORT_SUMMARY.revenueTrendPct)}
          </Badge>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_TREND_30D} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
              <XAxis
                key="x"
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval={4}
              />
              <YAxis
                key="y"
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v: number) => `${v}rb`}
              />
              <RechartsTooltip
                contentStyle={{ border: "2px solid var(--border)", borderRadius: 6 }}
                formatter={(v: number) => [formatIDR(v * 1000), "Pendapatan"]}
                labelFormatter={(l) => `Hari ${l}`}
              />
              <Line
                key="revenue-line"
                type="monotone"
                dataKey="revenue"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, stroke: "var(--border)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products table */}
      <div className="overflow-x-auto rounded-md border-2 border-border bg-card">
        <div className="border-b-2 border-border px-5 py-4">
          <span className="font-display text-base font-semibold">Produk Terlaris (Bulan Ini)</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Produk</TableHead>
              <TableHead className="text-right">Terjual</TableHead>
              <TableHead className="text-right">Pendapatan</TableHead>
              <TableHead className="text-right">Laba</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REPORT_TOP_PRODUCTS.map((p) => (
              <TableRow key={p.name} className="border-border/60">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-right">{formatNumber(p.sold)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCompactIDR(p.revenue)}</TableCell>
                <TableCell className="text-right font-semibold text-success">
                  {formatCompactIDR(p.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-md border-2 border-border bg-card p-8 text-center shadow-brutal">
        <span className="flex size-14 items-center justify-center rounded-md border-2 border-border bg-block-amber">
          <Lock className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="font-display">Laporan tersedia di Paket Pro</h2>
          <p className="text-muted-foreground">
            Buka laporan bulanan, laba kotor, laba bersih, dan export Excel/PDF untuk memantau
            usahamu lebih dalam.
          </p>
        </div>
        <Link
          to="/paket"
          className="press-scale flex items-center justify-center gap-2 rounded-md border-2 border-border bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-brutal-sm"
        >
          Upgrade Sekarang — Rp 25.000/bulan
        </Link>
        <span className="text-xs text-muted-foreground">Coba gratis 1 bulan dengan Trial Pro</span>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  sub,
  badge,
  tone = "card",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: string;
  sub?: string;
  badge?: string;
  tone?: "card" | "amber" | "green";
}) {
  const toneCls =
    tone === "amber" ? "bg-block-amber" : tone === "green" ? "bg-block-green" : "bg-card";
  return (
    <div className={cn("relative flex flex-col rounded-md border-2 border-border p-5", toneCls)}>
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-card">
          <Icon className="size-4" />
        </span>
        {trend && (
          <Badge className="border-2 border-border bg-success text-success-foreground">{trend}</Badge>
        )}
        {badge && <TierBadge tier={badge} />}
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ExportButton({
  icon: Icon,
  label,
  enabled,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  enabled: boolean;
}) {
  return (
    <button
      disabled={!enabled}
      className={cn(
        "press-scale flex items-center gap-2 rounded-md border-2 border-border px-3 py-2 text-sm font-semibold",
        enabled ? "bg-card hover:bg-block-amber" : "cursor-not-allowed bg-muted text-muted-foreground",
      )}
      title={!enabled ? "Export tersedia di Paket Pro" : undefined}
    >
      {enabled ? <Icon className="size-4" /> : <Lock className="size-4" />}
      Export {label}
    </button>
  );
}
