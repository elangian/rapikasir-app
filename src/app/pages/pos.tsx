import { useMemo, useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Banknote,
  ArrowLeftRight,
  QrCode,
  Tag,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { MobileDrawer } from "../components/shared/mobile-drawer";
import { cn } from "../components/ui/utils";
import { TierLock, TierBadge } from "../components/shared/tier-lock";
import { useTier } from "../context/tier-context";
import { useProducts } from "../context/products-context";
import { useTransactions } from "../context/transactions-context";
import { CATEGORIES, type Product } from "../data/mock-data";
import { formatIDR } from "../lib/format";
import { toast } from "sonner";

interface CartLine {
  product: Product;
  qty: number;
}

type PayMethod = "Cash" | "Transfer" | "QRIS";

export function POS() {
  const { tier, canUse } = useTier();
  const { products } = useProducts();
  const { recordTransaction } = useTransactions();
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [cartOpen, setCartOpen] = useState(false); // mobile bottom sheet
  const [checkingOut, setCheckingOut] = useState(false);

  const canDiscount = canUse("discount");
  const canQris = canUse("qris");

  // Demo: on FREE tier, ATK products are locked behind Pro.
  const isLocked = (p: Product) => tier === "FREE" && p.category === "ATK";

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "Semua" || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, category, query],
  );

  const addToCart = (p: Product) => {
    if (isLocked(p)) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === p.id);
      if (existing) {
        return prev.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const removeLine = (id: string) =>
    setCart((prev) => prev.filter((l) => l.product.id !== id));

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discountAmount = canDiscount ? Math.min(discount, subtotal) : 0;
  const total = subtotal - discountAmount;
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  const checkout = async () => {
    if (cart.length === 0 || checkingOut) return;
    setCheckingOut(true);
    try {
      const itemLabel =
        cart.length === 1 ? cart[0].product.name : `${cart[0].product.name} +${cart.length - 1} lainnya`;
      await recordTransaction({
        item: itemLabel,
        itemsCount: itemCount,
        total,
        method,
        items: cart.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          qty: l.qty,
          price: l.product.price,
          cost: l.product.cost,
        })),
      });
      toast.success("Transaksi berhasil diproses!", {
        description: `${cart.length} item • ${formatIDR(total)} • ${method}`,
      });
      setCart([]);
      setDiscount(0);
      setCartOpen(false);
    } catch (err) {
      toast.error("Transaksi gagal disimpan", {
        description: err instanceof Error ? err.message : "Coba lagi sebentar lagi.",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  // Cart card — reused in the desktop column and the mobile bottom sheet.
  const cartCard = (
    <div className="flex h-full flex-col rounded-md border-2 border-border bg-card lg:shadow-brutal">
      <div className="flex items-center gap-2 border-b-2 border-border px-4 py-3">
        <ShoppingCart className="size-5" />
        <span className="font-display font-semibold">Keranjang</span>
        <Badge className="ml-auto border-2 border-border bg-accent text-accent-foreground">
          {itemCount} item
        </Badge>
      </div>

      {/* Lines */}
      <div className="min-h-[120px] flex-1 overflow-y-auto p-3 lg:max-h-[40vh] lg:flex-none">
        {cart.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Keranjang kosong. Pilih produk di katalog.
          </p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {cart.map((l) => (
                <motion.li
                  key={l.product.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 rounded-md border-2 border-border bg-background p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatIDR(l.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changeQty(l.product.id, -1)}
                      className="press-scale flex size-6 items-center justify-center rounded-md border-2 border-border bg-card"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                    <button
                      onClick={() => changeQty(l.product.id, 1)}
                      className="press-scale flex size-6 items-center justify-center rounded-md border-2 border-border bg-card"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeLine(l.product.id)}
                    className="press-scale flex size-6 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-3 border-t-2 border-border p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatIDR(subtotal)}</span>
        </div>

        {/* Discount (Pro+) */}
        <div className="relative">
          <label className="mb-1 flex items-center gap-1.5 text-sm">
            <Tag className="size-3.5" /> Diskon
            {!canDiscount && <TierBadge tier="PRO" className="ml-1" />}
          </label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              disabled={!canDiscount}
              className="h-9 border-2 border-border bg-card"
            />
            {!canDiscount && <TierLock requiredTier="PRO" message="Diskon tersedia di Paket Pro" />}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="mb-1 text-sm">Metode Pembayaran</p>
          <div className="grid grid-cols-3 gap-2">
            <PayButton active={method === "Cash"} onClick={() => setMethod("Cash")} icon={Banknote} label="Cash" />
            <PayButton active={method === "Transfer"} onClick={() => setMethod("Transfer")} icon={ArrowLeftRight} label="Transfer" />
            <div className="relative">
              <PayButton
                active={method === "QRIS"}
                onClick={() => canQris && setMethod("QRIS")}
                icon={QrCode}
                label="QRIS"
                locked={!canQris}
              />
              {!canQris && <TierLock requiredTier="BUSINESS" message="QRIS tersedia di Paket Business" />}
            </div>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Diskon</span>
            <span className="font-semibold">- {formatIDR(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-end justify-between border-t-2 border-dashed border-border pt-3">
          <span className="text-sm font-medium">Total</span>
          <span className="font-display text-2xl font-extrabold text-primary">{formatIDR(total)}</span>
        </div>

        <button
          onClick={checkout}
          disabled={cart.length === 0 || checkingOut}
          className="press-scale flex w-full items-center justify-center gap-2 rounded-md border-2 border-border bg-accent py-3 font-semibold text-accent-foreground shadow-brutal-sm disabled:opacity-50 disabled:shadow-none"
        >
          {checkingOut ? "Memproses…" : "Proses Transaksi"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <div>
        <h1 className="font-display">Transaksi / Kasir</h1>
        <p className="text-muted-foreground">Pilih produk, atur keranjang, lalu proses pembayaran.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* ---------- Catalog ---------- */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk…"
              className="h-10 border-2 border-border bg-card pl-9"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "press-scale rounded-md border-2 border-border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-block-amber",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const locked = isLocked(p);
              const low = p.stock < 5;
              return (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => addToCart(p)}
                    disabled={locked || p.stock === 0}
                    className={cn(
                      "press-scale flex w-full flex-col overflow-hidden rounded-md border-2 border-border bg-card text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-accent disabled:cursor-not-allowed",
                    )}
                  >
                    <div className="flex h-20 items-center justify-center border-b-2 border-border bg-block-amber">
                      <span className="font-display text-2xl font-extrabold text-primary/30">
                        {p.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-2.5">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">{p.name}</p>
                      <p className="font-display mt-auto font-bold text-primary">
                        {formatIDR(p.price)}
                      </p>
                      <Badge
                        className={cn(
                          "border-2 border-border",
                          low ? "bg-destructive text-destructive-foreground" : "bg-block-green text-foreground",
                        )}
                      >
                        Stok {p.stock}
                      </Badge>
                    </div>
                  </button>
                  {locked && <TierLock requiredTier="PRO" message="Produk ATK tersedia di Paket Pro" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- Cart: desktop column ---------- */}
        <div className="hidden lg:block lg:sticky lg:top-20 lg:self-start">{cartCard}</div>
      </div>

      {/* ---------- Cart: mobile floating bar + bottom sheet ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-card p-3 lg:hidden">
        <button
          onClick={() => setCartOpen(true)}
          disabled={cart.length === 0}
          className="press-scale flex w-full items-center gap-3 rounded-md border-2 border-border bg-accent px-4 py-3 text-accent-foreground shadow-brutal-sm disabled:opacity-50 disabled:shadow-none"
        >
          <span className="relative flex size-8 items-center justify-center rounded-md border-2 border-border bg-card text-foreground">
            <ShoppingCart className="size-4" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full border-2 border-border bg-destructive text-[10px] font-bold text-destructive-foreground">
                {itemCount}
              </span>
            )}
          </span>
          <span className="font-semibold">
            {cart.length === 0 ? "Keranjang kosong" : "Lihat Keranjang"}
          </span>
          <span className="font-display ml-auto text-lg font-extrabold">{formatIDR(total)}</span>
        </button>
      </div>

      <MobileDrawer open={cartOpen} onClose={() => setCartOpen(false)} side="bottom" title="Keranjang">
        <div className="max-h-[80vh] overflow-y-auto bg-background p-3">{cartCard}</div>
      </MobileDrawer>
    </div>
  );
}

function PayButton({
  active,
  onClick,
  icon: Icon,
  label,
  locked,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
  locked?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        "press-scale flex flex-col items-center gap-1 rounded-md border-2 border-border py-2 text-xs font-semibold transition-colors duration-150",
        active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-block-amber",
        locked && "opacity-60",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}