import { useMemo, useState } from "react";
import { Download, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AdminLayout } from "../../components/layout/admin-layout";
import { ADMIN_TRANSACTIONS } from "../../data/mock-data";
import { formatIDR } from "../../lib/format";
import type { Tier } from "../../context/tier-context";

const TIER_LABEL: Record<"PRO" | "BUSINESS", string> = { PRO: "Pro", BUSINESS: "Business" };
const TIER_CLASS: Record<"PRO" | "BUSINESS", string> = {
  PRO: "bg-accent text-accent-foreground",
  BUSINESS: "bg-primary text-primary-foreground",
};
const STATUS_META = {
  sukses: { label: "Sukses", icon: CheckCircle2, cls: "bg-block-green text-foreground" },
  pending: { label: "Pending", icon: Clock, cls: "bg-block-amber text-foreground" },
  gagal: { label: "Gagal", icon: XCircle, cls: "border-destructive/40 text-destructive" },
} as const;

export function AdminSubscriptions() {
  const [methodFilter, setMethodFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [statusFilter, setStatusFilter] = useState<keyof typeof STATUS_META | "all">("all");
  const [exportLabel, setExportLabel] = useState("Export Laporan");

  const filtered = useMemo(
    () =>
      ADMIN_TRANSACTIONS.filter(
        (t) =>
          (methodFilter === "all" || t.method === methodFilter) &&
          (tierFilter === "all" || t.tier === tierFilter) &&
          (statusFilter === "all" || t.status === statusFilter),
      ),
    [methodFilter, tierFilter, statusFilter],
  );

  const handleExport = () => {
    const header = ["Waktu", "Toko", "Tier", "Jumlah (IDR)", "Metode", "Status"];
    const csv = [header.join(",")]
      .concat(
        filtered.map((t) =>
          [t.time, `"${t.store}"`, TIER_LABEL[t.tier as "PRO" | "BUSINESS"], t.amount, t.method, STATUS_META[t.status].label].join(","),
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapikasir-laporan-subscription.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setExportLabel("Terunduh");
    setTimeout(() => setExportLabel("Export Laporan"), 1800);
  };

  return (
    <AdminLayout
      pageTitle="Monitor Subscription"
      pageSubtitle="Transaksi pembayaran paket UMKM"
      headerAction={
        <button
          onClick={handleExport}
          className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-brutal-amber-sm"
        >
          <Download className="size-3.5" /> <span>{exportLabel}</span>
        </button>
      }
    >
      {/* Revenue metric */}
      <div className="mb-4 flex flex-col gap-4 rounded-md border-2 border-accent bg-admin-surface p-5 shadow-brutal-amber sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-admin-foreground/70">Pendapatan Juni 2026</p>
          <p className="font-display tnum mt-1 text-4xl font-extrabold tracking-tight">{formatIDR(36_750_000)}</p>
        </div>
        <span className="flex w-fit items-center gap-1 rounded-md border-2 border-border bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
          <TrendingUp className="size-3.5" /> +9,4% dari Mei 2026
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-md border-2 border-admin-border bg-admin-surface p-3 sm:flex-row sm:items-center">
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-10 flex-1 rounded-md border-2 border-admin-border bg-admin-bg px-3 text-sm text-admin-foreground"
        >
          <option value="all">Semua Metode</option>
          {["GoPay", "OVO", "DANA", "BCA", "Mandiri", "BRI", "BNI"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as Tier | "all")}
          className="h-10 flex-1 rounded-md border-2 border-admin-border bg-admin-bg px-3 text-sm text-admin-foreground"
        >
          <option value="all">Semua Tier</option>
          <option value="PRO">Pro</option>
          <option value="BUSINESS">Business</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as keyof typeof STATUS_META | "all")}
          className="h-10 flex-1 rounded-md border-2 border-admin-border bg-admin-bg px-3 text-sm text-admin-foreground"
        >
          <option value="all">Semua Status</option>
          <option value="sukses">Sukses</option>
          <option value="pending">Pending</option>
          <option value="gagal">Gagal</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-md border-2 border-admin-border bg-admin-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-admin-border text-admin-foreground/60">
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Toko</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Jumlah</th>
              <th className="px-4 py-3 font-medium">Metode</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const s = STATUS_META[t.status];
              const StatusIcon = s.icon;
              return (
                <tr key={i} className="border-b border-admin-border/50 last:border-0">
                  <td className="tnum px-4 py-3 text-admin-foreground/70">{t.time}</td>
                  <td className="px-4 py-3 font-medium">{t.store}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md border-2 border-border px-2 py-0.5 text-xs font-bold ${TIER_CLASS[t.tier as "PRO" | "BUSINESS"]}`}>
                      {TIER_LABEL[t.tier as "PRO" | "BUSINESS"]}
                    </span>
                  </td>
                  <td className="tnum px-4 py-3 font-semibold">{formatIDR(t.amount)}</td>
                  <td className="px-4 py-3 text-admin-foreground/70">{t.method}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-md border-2 border-border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
                      <StatusIcon className="size-3" />
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-admin-foreground/55">Tidak ada transaksi yang cocok dengan filter ini.</p>
        )}
      </div>
      <p className="mt-2 text-xs text-admin-foreground/45">
        <span>{filtered.length}</span> transaksi terbaru ditampilkan.
      </p>
    </AdminLayout>
  );
}
