import { useState, type ComponentType } from "react";
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
  Trash2,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import { TierBadge } from "../components/shared/tier-lock";
import { useTier } from "../context/tier-context";
import { useTransactions } from "../context/transactions-context";
import {
  REPORT_PERIOD_LABEL,
  type ReportPeriod,
  type PeriodReportData,
} from "../data/mock-data";
import { formatIDR, formatCompactIDR, formatPercent, formatNumber } from "../lib/format";
import { useSessionState } from "../lib/use-session-state";
import { toast } from "sonner";

const PERIODS: ReportPeriod[] = ["harian", "mingguan", "bulanan", "tahunan"];

const EMPTY_DATA: PeriodReportData = {
  summary: {
    periodLabel: "-",
    totalRevenue: 0,
    revenueTrendPct: 0,
    totalTransactions: 0,
    transactionsTrendPct: 0,
    grossProfit: 0,
    grossMarginPct: 0,
    netProfit: 0,
    netMarginPct: 0,
  },
  trendTitle: "Tren Pendapatan",
  trend: [],
  topProducts: [],
};

export function Laporan() {
  const { tier, canUse } = useTier();
  const { reportsByPeriod } = useTransactions();
  const locked = !canUse("reports"); // FREE tier
  const canExport = canUse("export");
  const canNet = canUse("netProfit");
  const isBusiness = tier === "BUSINESS";

  const [activePeriod, setActivePeriod] = useState<ReportPeriod>("bulanan");
  const [cleared, setCleared] = useSessionState<Record<ReportPeriod, boolean>>("rapikasir.laporan.cleared", {
    harian: false,
    mingguan: false,
    bulanan: false,
    tahunan: false,
  });

  const clearOne = (period: ReportPeriod) => {
    setCleared((prev) => ({ ...prev, [period]: true }));
    toast.success(`Laporan ${REPORT_PERIOD_LABEL[period]} dihapus`, {
      description: "Data ringkasan periode ini sudah dikosongkan.",
    });
  };

  const clearAll = () => {
    setCleared({ harian: true, mingguan: true, bulanan: true, tahunan: true });
    toast.success("Semua laporan dihapus", { description: "Harian, Mingguan, Bulanan, dan Tahunan dikosongkan." });
  };

  const allCleared = PERIODS.every((p) => cleared[p]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display">Laporan</h1>
          <p className="text-muted-foreground">Ringkasan performa usaha per periode.</p>
        </div>

        {!locked && (
          <div className="flex flex-wrap items-center gap-2">
            <ExportButton icon={FileSpreadsheet} label="Excel" enabled={canExport} />
            <ExportButton icon={FileText} label="PDF" enabled={canExport} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={allCleared}
                  className="press-scale flex items-center gap-2 rounded-md border-2 border-destructive/50 bg-card px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="size-4" /> Hapus Semua Laporan
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-2 border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus semua laporan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ini akan mengosongkan ringkasan Harian, Mingguan, Bulanan, dan Tahunan sekaligus. Tindakan ini
                    tidak bisa dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ya, Hapus Semua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Report body (blurred + overlay when locked) */}
      <div className="relative">
        <div className={cn(locked && "pointer-events-none select-none blur-[6px]")} aria-hidden={locked}>
          <Tabs value={activePeriod} onValueChange={(v) => setActivePeriod(v as ReportPeriod)}>
            <TabsList className="border-2 border-border bg-card">
              {PERIODS.map((p) => (
                <TabsTrigger key={p} value={p}>
                  {REPORT_PERIOD_LABEL[p]}
                </TabsTrigger>
              ))}
            </TabsList>

            {PERIODS.map((p) => (
              <TabsContent key={p} value={p} className="mt-4">
                <PeriodPanel
                  period={p}
                  data={cleared[p] ? EMPTY_DATA : reportsByPeriod[p]}
                  canNet={canNet}
                  isBusiness={isBusiness}
                  onClear={() => clearOne(p)}
                  cleared={cleared[p]}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {locked && <LockedOverlay />}
      </div>
    </div>
  );
}

function PeriodPanel({
  period,
  data,
  canNet,
  isBusiness,
  onClear,
  cleared,
}: {
  period: ReportPeriod;
  data: PeriodReportData;
  canNet: boolean;
  isBusiness: boolean;
  onClear: () => void;
  cleared: boolean;
}) {
  const s = data.summary;
  return (
    <div className="space-y-4">
      {/* Period sub-header: label + (bulanan only) month picker + per-tab delete */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-md border-2 border-border bg-card px-3 py-1.5 text-sm">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="font-medium">{s.periodLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {period === "bulanan" && (
            <Select defaultValue="jun26">
              <SelectTrigger className="h-9 w-[150px] border-2 border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-border">
                <SelectItem value="jun26">Juni 2026</SelectItem>
                <SelectItem value="mei26">Mei 2026</SelectItem>
                <SelectItem value="apr26">April 2026</SelectItem>
                {isBusiness && <SelectItem value="custom">Rentang Kustom…</SelectItem>}
              </SelectContent>
            </Select>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={cleared}
                className="press-scale flex items-center gap-2 rounded-md border-2 border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-3.5" /> Hapus Semua ({REPORT_PERIOD_LABEL[period]})
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-2 border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus laporan {REPORT_PERIOD_LABEL[period]}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cuma laporan {REPORT_PERIOD_LABEL[period]} yang dikosongkan — tab periode lain tidak terpengaruh.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Wallet}
          tone="amber"
          label="Total Pendapatan"
          value={formatIDR(s.totalRevenue)}
          trend={s.totalRevenue > 0 ? formatPercent(s.revenueTrendPct) : undefined}
        />
        <KpiCard
          icon={Receipt}
          label="Total Transaksi"
          value={formatNumber(s.totalTransactions)}
          trend={s.totalTransactions > 0 ? formatPercent(s.transactionsTrendPct) : undefined}
        />
        <KpiCard
          icon={TrendingUp}
          tone="green"
          label="Laba Kotor"
          value={formatIDR(s.grossProfit)}
          sub={s.totalRevenue > 0 ? `Margin ${s.grossMarginPct.toLocaleString("id-ID")}%` : undefined}
        />
        <KpiCard
          icon={PiggyBank}
          label="Laba Bersih"
          value={canNet ? formatIDR(s.netProfit) : "•••••••"}
          sub={canNet && s.totalRevenue > 0 ? `Margin ${s.netMarginPct.toLocaleString("id-ID")}%` : undefined}
          badge={!canNet ? "PRO" : undefined}
        />
      </div>

      {/* Trend chart */}
      <div className="rounded-md border-2 border-border bg-card p-5 shadow-brutal-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-base font-semibold">{data.trendTitle}</span>
          {s.totalRevenue > 0 && (
            <Badge className="border-2 border-border bg-block-green text-foreground">
              <TrendingUp className="size-3" /> {formatPercent(s.revenueTrendPct)}
            </Badge>
          )}
        </div>
        <div className="h-64">
          {data.trend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Belum ada data untuk periode ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
                <XAxis
                  key="x"
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={period === "harian" || period === "mingguan" ? 1 : period === "bulanan" ? 4 : 0}
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
          )}
        </div>
      </div>

      {/* Top products table */}
      <div className="overflow-x-auto rounded-md border-2 border-border bg-card">
        <div className="border-b-2 border-border px-5 py-4">
          <span className="font-display text-base font-semibold">Produk Terlaris ({REPORT_PERIOD_LABEL[period]})</span>
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
            {data.topProducts.map((p) => (
              <TableRow key={p.name} className="border-border/60">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-right">{formatNumber(p.sold)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCompactIDR(p.revenue)}</TableCell>
                <TableCell className="text-right font-semibold text-success">
                  {formatCompactIDR(p.profit)}
                </TableCell>
              </TableRow>
            ))}
            {data.topProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Belum ada data produk terlaris untuk periode ini.
                </TableCell>
              </TableRow>
            )}
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
            Buka laporan Harian, Mingguan, Bulanan, dan Tahunan lengkap dengan laba kotor, laba bersih, dan export
            Excel/PDF untuk memantau usahamu lebih dalam.
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