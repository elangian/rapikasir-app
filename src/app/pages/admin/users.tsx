import { useMemo, useState } from "react";
import { Search, Eye, ArrowUpCircle, Ban, CircleCheck } from "lucide-react";
import { AdminLayout } from "../../components/layout/admin-layout";
import { ADMIN_USERS } from "../../data/mock-data";
import { TIER_LABEL, type Tier } from "../../context/tier-context";

const TIER_CLASS: Record<Tier, string> = {
  FREE: "bg-admin-bg text-admin-foreground/80",
  TRIAL: "bg-block-amber text-foreground",
  PRO: "bg-accent text-accent-foreground",
  BUSINESS: "bg-primary text-primary-foreground",
};

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "aktif" | "nonaktif">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ADMIN_USERS.filter(
      (u) =>
        (tierFilter === "all" || u.tier === tierFilter) &&
        (statusFilter === "all" || u.status === statusFilter) &&
        (q === "" || u.store.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  }, [search, tierFilter, statusFilter]);

  return (
    <AdminLayout pageTitle="Manajemen User" pageSubtitle="7.588 UMKM terdaftar">
      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-md border-2 border-admin-border bg-admin-surface p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama toko atau email…"
            className="h-10 w-full rounded-md border-2 border-admin-border bg-admin-bg pl-9 pr-3 text-sm text-admin-foreground placeholder:text-admin-foreground/45"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as Tier | "all")}
          className="h-10 rounded-md border-2 border-admin-border bg-admin-bg px-3 text-sm text-admin-foreground"
        >
          <option value="all">Semua Tier</option>
          <option value="FREE">Free</option>
          <option value="TRIAL">Trial Pro</option>
          <option value="PRO">Pro</option>
          <option value="BUSINESS">Business</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "aktif" | "nonaktif")}
          className="h-10 rounded-md border-2 border-admin-border bg-admin-bg px-3 text-sm text-admin-foreground"
        >
          <option value="all">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-md border-2 border-admin-border bg-admin-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-admin-border text-admin-foreground/60">
              <th className="px-4 py-3 font-medium">Nama Toko</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Tanggal Daftar</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email} className="border-b border-admin-border/50 last:border-0">
                <td className="px-4 py-3 font-medium">{u.store}</td>
                <td className="px-4 py-3 text-admin-foreground/70">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md border-2 border-border px-2 py-0.5 text-xs font-bold ${TIER_CLASS[u.tier]}`}>
                    {TIER_LABEL[u.tier]}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-foreground/70">{u.date}</td>
                <td className="px-4 py-3">
                  {u.status === "aktif" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-border bg-block-green px-2 py-0.5 text-xs font-semibold text-foreground">
                      <span className="size-1.5 rounded-full bg-success" />Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-admin-border px-2 py-0.5 text-xs font-semibold text-admin-foreground/60">
                      <span className="size-1.5 rounded-full bg-admin-foreground/40" />Nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button title="Lihat detail" className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-admin-border hover:bg-admin-bg">
                      <Eye className="size-3.5" />
                    </button>
                    <button title="Upgrade manual" className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-admin-border hover:bg-admin-bg">
                      <ArrowUpCircle className="size-3.5" />
                    </button>
                    <button
                      title={u.status === "aktif" ? "Suspend user" : "Aktifkan user"}
                      className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-admin-border text-destructive hover:bg-destructive/10"
                    >
                      {u.status === "aktif" ? <Ban className="size-3.5" /> : <CircleCheck className="size-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-admin-foreground/55">Tidak ada user yang cocok dengan pencarian atau filter ini.</p>
        )}
      </div>
      <p className="mt-2 text-xs text-admin-foreground/45">
        <span>{filtered.length}</span> dari 7.588 user ditampilkan (contoh data terbaru).
      </p>
    </AdminLayout>
  );
}
