import { useMemo, useState } from "react";
import { Search, PackagePlus, PackageMinus, History, AlertTriangle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from "../components/ui/utils";
import { useProducts } from "../context/products-context";
import { formatNumber } from "../lib/format";
import { toast } from "sonner";

type Status = "Aktif" | "Menipis" | "Habis";

function statusOf(stock: number): Status {
  if (stock === 0) return "Habis";
  if (stock < 5) return "Menipis";
  return "Aktif";
}

const STATUS_STYLE: Record<Status, string> = {
  Aktif: "bg-block-green text-foreground",
  Menipis: "bg-accent text-accent-foreground",
  Habis: "bg-destructive text-destructive-foreground",
};

export function Stok() {
  const { products, movements, adjustStock } = useProducts();
  const [query, setQuery] = useState("");
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const lowStockCount = products.filter((p) => statusOf(p.stock) !== "Aktif").length;

  const getQty = (id: string) => qtyById[id] ?? 1;
  const setQty = (id: string, value: number) => setQtyById((prev) => ({ ...prev, [id]: Math.max(1, value) }));

  const handleAdjust = async (id: string, name: string, direction: 1 | -1) => {
    const qty = getQty(id);
    try {
      await adjustStock(id, qty * direction, direction > 0 ? "Restock manual" : "Koreksi/kerusakan");
      toast.success(direction > 0 ? "Stok ditambahkan" : "Stok dikurangi", {
        description: `${name} — ${direction > 0 ? "+" : "-"}${qty}`,
      });
    } catch (err) {
      toast.error("Gagal menyesuaikan stok", { description: err instanceof Error ? err.message : "Coba lagi." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display">Stok</h1>
        <p className="text-muted-foreground">Sesuaikan stok produk dan pantau riwayat perubahannya.</p>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border-2 border-accent bg-block-amber px-4 py-3 text-sm font-medium">
          <AlertTriangle className="size-4 shrink-0" />
          {lowStockCount} produk menipis atau habis — cek tabel di bawah.
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk…"
          className="h-10 border-2 border-border bg-card pl-9"
        />
      </div>

      {/* Adjust table */}
      <div className="overflow-x-auto rounded-md border-2 border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Produk</TableHead>
              <TableHead className="text-right">Stok Saat Ini</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Sesuaikan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const status = statusOf(p.stock);
              return (
                <TableRow key={p.id} className="border-border/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-border bg-block-amber font-display font-bold text-primary/40">
                        {p.name.charAt(0)}
                      </span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{p.stock}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("border-2 border-border", STATUS_STYLE[status])}>{status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        value={getQty(p.id)}
                        onChange={(e) => setQty(p.id, Number(e.target.value) || 1)}
                        className="h-8 w-16 border-2 border-border bg-card px-2 text-center"
                      />
                      <button
                        onClick={() => handleAdjust(p.id, p.name, -1)}
                        disabled={p.stock === 0}
                        title="Kurangi stok"
                        className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-border bg-card text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PackageMinus className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjust(p.id, p.name, 1)}
                        title="Tambah stok"
                        className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-border bg-card text-success hover:bg-success hover:text-success-foreground"
                      >
                        <PackagePlus className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {products.length === 0 ? "Belum ada produk. Tambah produk dulu di halaman Produk." : "Tidak ada produk yang cocok."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Movement history */}
      <div className="overflow-x-auto rounded-md border-2 border-border bg-card">
        <div className="flex items-center gap-2 border-b-2 border-border px-5 py-4">
          <History className="size-4" />
          <span className="font-display text-base font-semibold">Riwayat Perubahan Stok</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Waktu</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-right">Stok Akhir</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((m) => (
              <TableRow key={m.id} className="border-border/60">
                <TableCell className="text-muted-foreground">{m.timestamp}</TableCell>
                <TableCell className="font-medium">{m.productName}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-2 border-border",
                      m.type === "masuk" ? "bg-block-green text-foreground" : "bg-destructive text-destructive-foreground",
                    )}
                  >
                    {m.type === "masuk" ? "Masuk" : "Keluar"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {m.type === "masuk" ? "+" : "-"}
                  {formatNumber(m.qty)}
                </TableCell>
                <TableCell className="text-right">{formatNumber(m.resultingStock)}</TableCell>
                <TableCell className="text-muted-foreground">{m.reason}</TableCell>
              </TableRow>
            ))}
            {movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Belum ada perubahan stok di sesi ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
