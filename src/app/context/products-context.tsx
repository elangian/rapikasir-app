import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "../lib/supabase";
import type { Product } from "../data/mock-data";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "masuk" | "keluar";
  qty: number;
  resultingStock: number;
  reason: string;
  timestamp: string;
}

export interface NewProductInput {
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
}

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  movements: StockMovement[];
  addProduct: (input: NewProductInput) => Promise<void>;
  adjustStock: (productId: string, delta: number, reason: string) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  removeAllProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

function formatTimestamp(d: Date): string {
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Products are per-store, persisted in Supabase (`products` table, scoped by
 * `store_id`). A brand new store genuinely has zero rows here — this is NOT
 * seeded with the old mock catalog on purpose, so a fresh test signup shows
 * an empty catalog until products are actually added via `addProduct`.
 */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    supabase
      .from("products")
      .select("id, name, category, price, cost, stock")
      .eq("store_id", user.id)
      .order("name")
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("Gagal ambil produk:", error.message);
          setProducts([]);
        } else {
          setProducts((data ?? []) as Product[]);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const addProduct: ProductsContextValue["addProduct"] = async (input) => {
    if (!user) throw new Error("Belum login.");
    const { data, error } = await supabase
      .from("products")
      .insert({ store_id: user.id, ...input })
      .select("id, name, category, price, cost, stock")
      .single();
    if (error) throw error;
    setProducts((prev) => [...prev, data as Product].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const adjustStock: ProductsContextValue["adjustStock"] = async (productId, delta, reason) => {
    const current = products.find((p) => p.id === productId);
    if (!current) return;
    const newStock = Math.max(0, current.stock + delta);

    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    if (error) throw error;

    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
    setMovements((mv) => [
      {
        id: `${Date.now()}-${productId}`,
        productId,
        productName: current.name,
        type: delta >= 0 ? "masuk" : "keluar",
        qty: Math.abs(delta),
        resultingStock: newStock,
        reason,
        timestamp: formatTimestamp(new Date()),
      },
      ...mv,
    ]);
  };

  const removeProduct: ProductsContextValue["removeProduct"] = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const removeAllProducts = async () => {
    if (!user || products.length === 0) return;
    const { error } = await supabase.from("products").delete().eq("store_id", user.id);
    if (error) throw error;
    setProducts([]);
  };

  return (
    <ProductsContext.Provider
      value={{ products, loading, movements, addProduct, adjustStock, removeProduct, removeAllProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductsProvider");
  return ctx;
}
