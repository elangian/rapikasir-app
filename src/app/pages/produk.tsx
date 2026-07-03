import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
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
import { cn } from "../components/ui/utils";
import { ProductLimit, useProductUsage } from "../components/shared/product-limit";
import { PRODUCTS, CATEGORIES, type Product } from "../data/mock-data";
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

export function Produk() {
  const [items, setItems] = useState<Product[]>(PRODUCTS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const { limit, unlimited } = useProductUsage();

  const atLimit = !unlimited && items.length >= limit;

  const filtered = useMemo(
    () =>
      items.filter(
        (p) =>
          (category === "Semua" || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query, category],
  );

  const removeProduct = (p: Product) => {
    setItems((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Produk dihapus", { description: p.name });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display">Produk</h1>
          <p className="text-muted-foreground">Kelola katalog dan pantau kuota paketmu.</p>
        </div>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block w-full sm:w-auto">
                <button
                  disabled={atLimit}
                  onClick={() => toast.info("Form tambah produk", { description: "Segera hadir di RapiKasir." })}
                  className={cn(
                    "press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent px-4 py-2 font-semibold text-accent-foreground shadow-brutal-sm sm:w-auto",
                    atLimit && "cursor-not-allowed opacity-50 shadow-none",
                  )}
                >
                  <Plus className="size-4" /> Tambah Produk
                </button>
              </span>
            </TooltipTrigger>
            {atLimit && (
              <TooltipContent className="border-2 border-border bg-primary text-primary-foreground">
                Kuota produk penuh. Upgrade paket untuk menambah produk.
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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
                        onClick={() => toast.info("Edit produk", { description: p.name })}
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
                  Tidak ada produk yang cocok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
