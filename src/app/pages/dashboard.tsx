import { useMemo } from "react";
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
import { formatIDR, formatNumber } from "../lib/format";
import { useProducts } from "../context/products-context";

/**
 * Dashboard now reflects the logged-in store's real product/stock data
 * (from ProductsContext). Revenue/transactions/top-products don't have a
 * real backing source yet — POS checkout doesn't persist to Supabase's
 * `transactions` table yet — so those sections show a genuine empty state
 * instead of the old mock numbers, rather than pretending activity that
 * never happened.
 */
export function Dashboard() {
  const { products } = useProducts();

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => p.stock < 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 4),
    [products],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display">Dashboard</h1>
          <p className="text-muted-foreground">Performa toko kamu.</p>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hero revenue [2x1] */}
        <BentoCard tone="card" raised className="sm:col-span-2">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</span>
          </div>
          <p className="font-display mt-3 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            {formatIDR(0)}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Belum ada transaksi tercatat — mulai catat penjualan lewat halaman Transaksi.
          </p>
        </BentoCard>

        {/* Transactions count [1x1] */}
        <BentoCard>
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-block-amber">
            <Receipt className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-muted-foreground">Transaksi Hari Ini</p>
          <p className="font-display text-3xl font-extrabold">0</p>
        </BentoCard>

        {/* Active products [1x1] */}
        <BentoCard>
          <span className="flex size-9 items-center justify-center rounded-md border-2 border-border bg-block-green">
            <Package className="size-4" />
          </span>
          <p className="mt-3 text-sm font-medium text-muted-foreground">Produk Aktif</p>
          <p className="font-display text-3xl font-extrabold">{formatNumber(products.length)}</p>
          <ProductLimit showUpgrade className="mt-auto pt-3" />
        </BentoCard>

        {/* Top products [2x1] */}
        <BentoCard className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold">Produk Terlaris</span>
            <span className="text-xs text-muted-foreground">Top 5</span>
          </div>
          <div className="mt-3 flex h-44 items-center justify-center text-center text-sm text-muted-foreground">
            Belum ada data penjualan.
          </div>
        </BentoCard>

        {/* Low stock [1x1] — real data from products context */}
        <BentoCard tone="card" className={lowStock.length > 0 ? "border-destructive" : undefined}>
          <div className="flex items-center justify-between">
            <span
              className={`flex items-center gap-1.5 text-sm font-semibold ${lowStock.length > 0 ? "text-destructive" : ""}`}
            >
              <AlertTriangle className="size-4" />
              Stok Menipis
            </span>
            {lowStock.length > 0 && (
              <span className="animate-rk-pulse flex size-6 items-center justify-center rounded-md border-2 border-border bg-destructive text-xs font-bold text-destructive-foreground">
                {lowStock.length}
              </span>
            )}
          </div>
          {lowStock.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="font-bold text-destructive">{p.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Semua produk stoknya aman.</p>
          )}
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
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            Belum ada transaksi. Catat transaksi pertamamu di halaman Transaksi.
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
