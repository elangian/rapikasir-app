import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildReportsByPeriod, type TransactionRecord } from "./reports";

// Local calendar dates: deterministic across developer and CI time zones.
function tx(day: number, total: number, items: TransactionRecord["items"] = [], month = 9): TransactionRecord {
  return { id: `${month}-${day}`, createdAt: new Date(2026, month, day, 12).toISOString(), item: "Sale", itemsCount: 1, total, method: "Cash", items };
}
const coffee = { productId: "coffee", name: "Coffee", qty: 2, price: 10000, cost: 6000 };

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 9, 16)); });
afterEach(() => { vi.useRealTimers(); });

describe("transaction reports", () => {
  it("calculates revenue, profit and previous-day trends from actual items", () => {
    const result = buildReportsByPeriod([tx(9, 20000, [coffee]), tx(9, 10000, [{ ...coffee, qty: 1 }]), tx(8, 10000, [{ ...coffee, qty: 1 }])]);
    expect(result.harian.summary).toMatchObject({ totalRevenue: 30000, totalTransactions: 2, grossProfit: 12000, grossMarginPct: 40, revenueTrendPct: 200, transactionsTrendPct: 100 });
    expect(result.harian.topProducts).toEqual([{ name: "Coffee", sold: 3, revenue: 30000, profit: 12000 }]);
    expect(result.harian.trend.at(-1)).toEqual({ label: "Ini", revenue: 30 });
  });
  it("handles empty reports and historical transactions without item details", () => {
    expect(buildReportsByPeriod([]).harian.summary).toMatchObject({ totalRevenue: 0, grossProfit: 0, grossMarginPct: 0, revenueTrendPct: 0 });
    const report = buildReportsByPeriod([tx(9, 25000)]).harian;
    expect(report.summary.totalRevenue).toBe(25000);
    expect(report.summary.grossProfit).toBe(0);
    expect(report.topProducts).toEqual([]);
  });
  it("separates calendar periods including Monday weeks and previous month", () => {
    const result = buildReportsByPeriod([tx(9, 1000), tx(5, 2000), tx(4, 4000), tx(30, 8000, [], 8)]);
    expect(result.harian.summary.totalRevenue).toBe(1000);
    expect(result.mingguan.summary).toMatchObject({ totalRevenue: 3000, revenueTrendPct: -75 });
    expect(result.bulanan.summary).toMatchObject({ totalRevenue: 7000, revenueTrendPct: -12.5 });
    expect(result.tahunan.summary.totalRevenue).toBe(15000);
  });
  it("uses inclusive start and exclusive end at midnight", () => {
    const first = { ...tx(9, 1000), createdAt: new Date(2026, 9, 9, 0).toISOString() };
    const next = { ...tx(10, 9000), createdAt: new Date(2026, 9, 10, 0).toISOString() };
    expect(buildReportsByPeriod([first, next]).harian.summary.totalRevenue).toBe(1000);
  });
  it("keeps different product IDs separate even with matching names, and limits top products", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ productId: `p${i}`, name: "Same name", qty: 1, price: (i + 1) * 1000, cost: 500 }));
    const result = buildReportsByPeriod([tx(9, 55000, items)]).harian.topProducts;
    expect(result).toHaveLength(8);
    expect(result[0]).toMatchObject({ sold: 1, revenue: 10000, profit: 9500 });
    expect(result.at(-1)?.revenue).toBe(3000);
  });
});
