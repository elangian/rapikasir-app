import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Loader2, RefreshCw } from "lucide-react";
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
import { supabase } from "../../lib/supabase";
import { TIER_LABEL, type Tier } from "../../context/tier-context";
import { toast } from "sonner";

const TIER_CLASS: Record<Tier, string> = {
  FREE: "bg-admin-bg text-admin-foreground/80",
  TRIAL: "bg-block-amber text-foreground",
  PRO: "bg-accent text-accent-foreground",
  BUSINESS: "bg-primary text-primary-foreground",
};

interface StoreRow {
  id: string;
  store_name: string;
  owner_name: string;
  tier: Tier;
  onboarded: boolean;
  created_at: string;
}

export function AdminUsers() {
  const [rows, setRows] = useState<StoreRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("stores")
      .select("id, store_name, owner_name, tier, onboarded, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setErrorMsg(error.message);
      setRows([]);
    } else {
      setRows(data as StoreRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (tierFilter === "all" || r.tier === tierFilter) &&
        (q === "" || r.store_name.toLowerCase().includes(q) || r.owner_name.toLowerCase().includes(q)),
    );
  }, [rows, search, tierFilter]);

  const removeOne = async (id: string, name: string) => {
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (error) {
      toast.error("Gagal hapus", { description: error.message });
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    toast.success("Toko dihapus", { description: name });
  };

  const removeAll = async () => {
    if (!rows || rows.length === 0) return;
    const ids = rows.map((r) => r.id);
    const { error } = await supabase.from("stores").delete().in("id", ids);
    if (error) {
      toast.error("Gagal hapus semua", { description: error.message });
      return;
    }
    setRows([]);
    toast.success("Semua toko dihapus", { description: `${ids.length} akun dihapus dari tabel stores.` });
  };

  return (
    <AdminLayout
      pageTitle="Manajemen User"
      pageSubtitle={rows ? `${rows.length} toko terdaftar (data langsung dari Supabase)` : "Memuat…"}
      headerAction={
        <button
          onClick={load}
          className="press-scale flex items-center gap-2 rounded-md border-2 border-admin-border px-3 py-2 text-xs font-semibold hover:bg-admin-bg"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      }
    >
      {/* Filters + hapus semua */}
      <div className="flex flex-col gap-3 rounded-md border-2 border-admin-border bg-admin-surface p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama toko atau pemilik…"
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={!rows || rows.length === 0}
              className="press-scale flex items-center gap-2 rounded-md border-2 border-destructive/50 bg-admin-bg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-3.5" /> Hapus Semua
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-2 border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus semua toko terdaftar?</AlertDialogTitle>
              <AlertDialogDescription>
                Ini akan menghapus {rows?.length ?? 0} baris dari tabel <code>stores</code> di Supabase — sungguhan,
                bukan cuma tampilan. Akun login (email/password) pemiliknya tetap ada di Supabase Auth, cuma profil
                tokonya yang hilang. Tindakan ini tidak bisa dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={removeAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ya, Hapus Semua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-md border-2 border-admin-border bg-admin-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-admin-border text-admin-foreground/60">
              <th className="px-4 py-3 font-medium">Nama Toko</th>
              <th className="px-4 py-3 font-medium">Pemilik</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Onboarding</th>
              <th className="px-4 py-3 font-medium">Daftar Sejak</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-admin-foreground/55">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-admin-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium">{r.store_name}</td>
                  <td className="px-4 py-3 text-admin-foreground/70">{r.owner_name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md border-2 border-border px-2 py-0.5 text-xs font-bold ${TIER_CLASS[r.tier]}`}>
                      {TIER_LABEL[r.tier]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.onboarded ? (
                      <span className="text-success">Selesai</span>
                    ) : (
                      <span className="text-admin-foreground/50">Belum</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-admin-foreground/70">
                    {new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            title="Hapus toko ini"
                            className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-admin-border text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-2 border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus "{r.store_name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Baris ini akan dihapus dari tabel <code>stores</code> di Supabase secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeOne(r.id, r.store_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Ya, Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && errorMsg && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-destructive">
                  Gagal memuat data: {errorMsg}
                </td>
              </tr>
            )}
            {!loading && !errorMsg && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-admin-foreground/55">
                  Belum ada toko yang cocok / terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-admin-foreground/45">
        <span>{filtered.length}</span> dari {rows?.length ?? 0} toko ditampilkan — data langsung dari tabel{" "}
        <code>stores</code> di Supabase.
      </p>
    </AdminLayout>
  );
}
