import { useMemo, useState, type FormEvent } from "react";
import { Search, Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { cn } from "../components/ui/utils";
import { ProductLimit, useProductUsage } from "../components/shared/product-limit";
import { useProducts } from "../context/products-context";
import { CATEGORIES } from "../data/mock-data";
import { formatIDR } from "../lib/format";
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

const ADD_CATEGORIES = CATEGORIES.filter((c) => c !== "Semua");

export function Produk() {
  const { products: items, addProduct, removeProduct: removeProductById, removeAllProducts } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const { limit, unlimited } = useProductUsage();

  const atLimit = !unlimited && items.length >= limit;

  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: ADD_CATEGORIES[0], price: "", cost: "", stock: "" });

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          (category === "Semua" || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query, category],
  );

  const removeProduct = async (p: { id: string; name: string }) => {
    try {
      await removeProductById(p.id);
      toast.success("Produk dihapus", { description: p.name });
    } catch (err) {
      toast.error("Gagal menghapus produk", { description: err instanceof Error ? err.message : "Coba lagi." });
    }
  };

  const removeAll = async () => {
    try {
      await removeAllProducts();
      toast.success("Semua produk dihapus", { description: "Katalog produk sekarang kosong." });
    } catch (err) {
      toast.error("Gagal menghapus semua produk", { description: err instanceof Error ? err.message : "Coba lagi." });
    }
  };

  const submitAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addProduct({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        stock: Number(form.stock) || 0,
      });
      toast.success("Produk ditambahkan", { description: form.name.trim() });
      setForm({ name: "", category: ADD_CATEGORIES[0], price: "", cost: "", stock: "" });
      setAddOpen(false);
    } catch (err) {
      toast.error("Gagal menambah produk", { description: err instanceof Error ? err.message : "Coba lagi." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display">Produk</h1>
          <p className="text-muted-foreground">Kelola katalog dan pantau kuota paketmu.</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block w-full sm:w-auto">
                    <DialogTrigger asChild>
                      <button
                        disabled={atLimit}
                        className={cn(
                          "press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent px-4 py-2 font-semibold text-accent-foreground shadow-brutal-sm sm:w-auto",
                          atLimit && "cursor-not-allowed opacity-50 shadow-none",
                        )}
                      >
                        <Plus className="size-4" /> Tambah Produk
                      </button>
                    </DialogTrigger>
                  </span>
                </TooltipTrigger>
                {atLimit && (
                  <TooltipContent className="border-2 border-border bg-primary text-primary-foreground">
                    Kuota produk penuh. Upgrade paket untuk menambah produk.
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <DialogContent className="border-2 border-border">
              <DialogHeader>
                <DialogTitle>Tambah Produk</DialogTitle>
                <DialogDescription>Isi detail produk baru untuk katalog tokomu.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitAdd} className="space-y-4">
                <div>
                  <label htmlFor="p-name" className="mb-1.5 block text-sm font-medium">Nama Produk</label>
                  <input
                    id="p-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    className="h-10 w-full rounded-md border-2 border-border bg-card px-3 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="p-cat" className="mb-1.5 block text-sm font-medium">Kategori</label>
                  <select
                    id="p-cat"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="h-10 w-full rounded-md border-2 border-border bg-card px-3 text-sm"
                  >
                    {ADD_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="p-price" className="mb-1.5 block text-sm font-medium">Harga Jual</label>
                    <input
                      id="p-price"
                      type="number"
                      min={0}
                      required
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="0"
                      className="h-10 w-full rounded-md border-2 border-border bg-card px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="p-cost" className="mb-1.5 block text-sm font-medium">Harga Modal</label>
                    <input
                      id="p-cost"
                      type="number"
                      min={0}
                      value={form.cost}
                      onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                      placeholder="0"
                      className="h-10 w-full rounded-md border-2 border-border bg-card px-3 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="p-stock" className="mb-1.5 block text-sm font-medium">Stok Awal</label>
                  <input
                    id="p-stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    className="h-10 w-full rounded-md border-2 border-border bg-card px-3 text-sm"
                  />
                </div>
                <DialogFooter>
                  <button
                    type="submit"
                    disabled={saving}
                    className="press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-brutal-sm disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    {saving ? "Menyimpan…" : "Simpan Produk"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={items.length === 0}
                className="press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-destructive/50 bg-card px-4 py-2 font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Trash2 className="size-4" /> Hapus Semua
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-2 border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus semua produk?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua {items.length} produk di katalog kamu akan dihapus permanen dari database. Tindakan ini tidak
                  bisa dibatalkan.
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
      </div>

      {/* Limit indicator */}
      <div className="rounded-md border-2 border-border bg-card p-4 shadow-brutal-sm">
        <div className="mb-2 flex items-center gap-2">
          <Package className="size-4" />
          <span className="font-display text-sm font-semibold">Kuota Produk</span>
        </div>
        <ProductLimit showUpgrade />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk…"
            className="h-10 border-2 border-border bg-card pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "press-scale rounded-md border-2 border-border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                category === c ? "bg-primary text-primary-foreground" : "bg-card hover:bg-block-amber",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border-2 border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
                  <TableCell>
                    <Badge className="border-2 border-border bg-background text-foreground">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatIDR(p.price)}</TableCell>
                  <TableCell className="text-right font-medium">{p.stock}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn("border-2 border-border", STATUS_STYLE[status])}>{status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => toast.info("Edit produk", { description: "Segera hadir — untuk sekarang, hapus lalu tambah ulang." })}
                        className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-border bg-card hover:bg-block-amber"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => removeProduct(p)}
                        className="press-scale flex size-8 items-center justify-center rounded-md border-2 border-border bg-card text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {items.length === 0 ? "Belum ada produk. Klik \"Tambah Produk\" untuk mulai." : "Tidak ada produk yang cocok."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
