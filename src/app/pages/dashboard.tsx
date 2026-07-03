import { Link } from "react-router";
import {
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Package,
  Plus,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import { BentoCard } from "../components/shared/bento-card";
import { ProductLimit } from "../components/shared/product-limit";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { formatIDR, formatPercent, formatNumber } from "../lib/format";
import {
  DASHBOARD_METRICS,
  TOP_PRODUCTS,
  RECENT_TRANSACTIONS,
  LOW_STOCK,
  REVENUE_SPARKLINE,
  PRODUCTS,
  type Transaction,
} from "../data/mock-data";

const METHOD_STYLE: Record<Transaction["method"], string> = {
  Cash: "bg-block-green text-foreground border-border",
  Transfer: "bg-block-amber text-foreground border-border",
  QRIS: "bg-primary text-primary-foreground border-border",
};

export function Dashboard() {
  const m = DASHBOARD_METRICS;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display">Dashboard</h1>
          <p className="text-muted-foreground">Performa toko kamu hari ini, Rabu 1 Juli 2026.</p>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hero revenue [2x1] */}
        <BentoCard tone="card" raised className="sm:col-span-2">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</span>
            <Badge className="border-2 border-border bg-block-green text-foreground">
              <TrendingUp className="size-3" />
              {formatPercent(m.revenueTrendPct)} vs kemarin
            </Badge>
          </div>
          <p className="font-display mt-3 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            {formatIDR(m.revenueToday)}
          </p>
          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_SPARKLINE} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <Area
                  key="rev-area"
                  type="monotone"
                  dataKey="v"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="var(--accent)"
                  fillOpacity={0.18}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Transactions count [1x1] */}
        <BentoCard>
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-block-amber">
            <Receipt className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-muted-foreground">Transaksi Hari Ini</p>
          <p className="font-display text-3xl font-extrabold">{m.transactionsToday}</p>
          <p className="mt-auto flex items-center gap-1 text-xs font-semibold text-success">
            <ArrowUpRight className="size-3" />
            {formatPercent(m.transactionsTrendPct)}
          </p>
        </BentoCard>

        {/* Active products [1x1] */}
        <BentoCard>
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-block-green">
            <Package className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-muted-foreground">Produk Aktif</p>
          <p className="font-display text-3xl font-extrabold">{formatNumber(PRODUCTS.length)}</p>
          <ProductLimit showUpgrade className="mt-auto pt-3" />
        </BentoCard>

        {/* Top products [2x1] */}
        <BentoCard className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold">Produk Terlaris</span>
            <span className="text-xs text-muted-foreground">Top 5 hari ini</span>
          </div>
          <div className="mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={TOP_PRODUCTS}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                barCategoryGap={8}
              >
                <XAxis key="x" type="number" hide />
                <YAxis
                  key="y"
                  type="category"
                  dataKey="name"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                />
                <RechartsTooltip
                  cursor={{ fill: "var(--block-amber)" }}
                  contentStyle={{ border: "2px solid var(--border)", borderRadius: 6 }}
                  formatter={(v: number) => [`${v} terjual`, ""]}
                />
                <Bar key="sold-bar" dataKey="sold" radius={[0, 4, 4, 0]} stroke="var(--border)" strokeWidth={2}>
                  {TOP_PRODUCTS.map((p, i) => (
                    <Cell key={`cell-${p.name}`} fill={i === 0 ? "var(--accent)" : "var(--secondary)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Low stock [1x1] */}
        <BentoCard tone="card" className="border-destructive">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
              <AlertTriangle className="size-4" />
              Stok Menipis
            </span>
            <span className="animate-rk-pulse flex size-6 items-center justify-center rounded-md border-2 border-border bg-destructive text-xs font-bold text-destructive-foreground">
              {LOW_STOCK.length}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {LOW_STOCK.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{p.name}</span>
                <span className="font-bold text-destructive">{p.stock}</span>
              </li>
            ))}
          </ul>
        </BentoCard>

        {/* Quick action: new transaction [1x1] */}
        <BentoCard tone="amber" raised className="justify-between">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-accent">
            <Plus className="size-5" />
          </span>
          <div className="mt-4">
            <p className="font-display font-semibold">Transaksi Baru</p>
            <p className="text-xs text-foreground/70">Buka kasir & catat penjualan</p>
          </div>
          <Link
            to="/transaksi"
            className="press-scale mt-3 flex items-center justify-center gap-1 rounded-md border-2 border-border bg-accent py-2 text-sm font-semibold text-accent-foreground"
          >
            + Transaksi Baru
          </Link>
        </BentoCard>

        {/* Quick action: add product [1x1] */}
        <BentoCard className="justify-between">
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-block-green">
            <Package className="size-5" />
          </span>
          <div className="mt-4">
            <p className="font-display font-semibold">Tambah Produk</p>
            <p className="text-xs text-muted-foreground">Kelola katalog toko</p>
          </div>
          <Link
            to="/produk"
            className="press-scale mt-3 flex items-center justify-center gap-1 rounded-md border-2 border-border bg-card py-2 text-sm font-semibold"
          >
            + Tambah Produk
          </Link>
        </BentoCard>

        {/* Recent transactions [2x1 spanning full width] */}
        <BentoCard className="sm:col-span-2 lg:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-base font-semibold">Transaksi Terakhir</span>
            <Link to="/transaksi" className="text-xs font-semibold text-secondary hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Waktu</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Metode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_TRANSACTIONS.map((t) => (
                  <TableRow key={t.id} className="border-border/60">
                    <TableCell className="font-medium">{t.time}</TableCell>
                    <TableCell className="text-muted-foreground">{t.id}</TableCell>
                    <TableCell>
                      <span className="font-medium">{t.item}</span>
                      {t.itemsCount > 1 && (
                        <span className="text-muted-foreground"> +{t.itemsCount - 1} item</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatIDR(t.total)}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={`border-2 ${METHOD_STYLE[t.method]}`}>{t.method}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
