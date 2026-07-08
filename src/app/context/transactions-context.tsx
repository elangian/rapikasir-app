import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "../lib/supabase";
import type { ReportPeriod, PeriodReportData } from "../data/mock-data";
import {
  buildReportsByPeriod,
  type TransactionRecord,
  type NewTransactionInput,
} from "../lib/reports";

export type { TransactionRecord, NewTransactionInput, TransactionItem, PayMethod } from "../lib/reports";

interface TransactionsContextValue {
  transactions: TransactionRecord[];
  loading: boolean;
  recordTransaction: (input: NewTransactionInput) => Promise<void>;
  reportsByPeriod: Record<ReportPeriod, PeriodReportData>;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

const SELECT_COLUMNS = "id, created_at, item, items_count, total, method, items";

// DB row (snake_case, items already parsed by supabase-js since the column is jsonb) -> app shape.
function fromRow(row: Record<string, unknown>): TransactionRecord {
  const rawItems = Array.isArray(row.items) ? (row.items as Record<string, unknown>[]) : [];
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    item: row.item as string,
    itemsCount: Number(row.items_count),
    total: Number(row.total),
    method: row.method as TransactionRecord["method"],
    items: rawItems.map((it) => ({
      productId: String(it.product_id ?? ""),
      name: String(it.name ?? ""),
      qty: Number(it.qty ?? 0),
      price: Number(it.price ?? 0),
      cost: Number(it.cost ?? 0),
    })),
  };
}

/**
 * Transactions are per-store, persisted in Supabase (`transactions` table,
 * scoped by `store_id`) — same pattern as ProductsContext. A checkout in
 * pos.tsx calls `recordTransaction`, which writes the row and updates local
 * state; laporan.tsx reads `reportsByPeriod`, which is derived (via
 * lib/reports.ts) straight from those real rows instead of mock data.
 */
export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    supabase
      .from("transactions")
      .select(SELECT_COLUMNS)
      .eq("store_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("Gagal ambil transaksi:", error.message);
          setTransactions([]);
        } else {
          setTransactions((data ?? []).map(fromRow));
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const recordTransaction: TransactionsContextValue["recordTransaction"] = async (input) => {
    if (!user) throw new Error("Belum login.");
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        store_id: user.id,
        item: input.item,
        items_count: input.itemsCount,
        total: input.total,
        method: input.method,
        items: input.items.map((it) => ({
          product_id: it.productId,
          name: it.name,
          qty: it.qty,
          price: it.price,
          cost: it.cost,
        })),
      })
      .select(SELECT_COLUMNS)
      .single();
    if (error) throw error;
    setTransactions((prev) => [fromRow(data), ...prev]);
  };

  const reportsByPeriod = useMemo(() => buildReportsByPeriod(transactions), [transactions]);

  return (
    <TransactionsContext.Provider value={{ transactions, loading, recordTransaction, reportsByPeriod }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within a TransactionsProvider");
  return ctx;
}
