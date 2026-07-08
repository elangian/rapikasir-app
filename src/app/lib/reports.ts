import type { ReportPeriod, PeriodReportData, ReportProductRow, ReportSummary } from "../data/mock-data";

/**
 * Aggregates real transactions (from Supabase, via TransactionsContext) into
 * the same `PeriodReportData` shape the Laporan page already renders. This
 * file has zero Supabase/React dependencies on purpose — it's a pure
 * function of (transactions, now) so it's easy to reason about and test.
 *
 * Known simplification: there's no operating-expense tracking anywhere in
 * the app yet, so "Laba Bersih" (net profit) is set equal to "Laba Kotor"
 * (gross profit) — i.e. net = gross - 0 biaya lain. That's honest given what
 * data actually exists, unlike the old mock which used a made-up 63.5%
 * ratio. Wire up a real expenses feature later if net profit needs to differ.
 */

export type PayMethod = "Cash" | "Transfer" | "QRIS";

export interface TransactionItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export interface TransactionRecord {
  id: string;
  createdAt: string; // ISO timestamp
  item: string;
  itemsCount: number;
  total: number;
  method: PayMethod;
  items: TransactionItem[];
}

export interface NewTransactionInput {
  item: string;
  itemsCount: number;
  total: number;
  method: PayMethod;
  items: TransactionItem[];
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
const MONTH_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/* ---------- date helpers (all local-time, matches the user's own clock) ---------- */

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function startOfWeek(d: Date): Date {
  // Monday-start week, matches the original mock's "Minggu ini, 29 Jun–2 Jul" framing.
  const day = d.getDay(); // 0 = Sun .. 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(d, diff));
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}
function fmtDM(d: Date): string {
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}
function fmtDMY(d: Date): string {
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtRange(start: Date, end: Date): string {
  if (start.toDateString() === end.toDateString()) return fmtDMY(end);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_ABBR[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (start.getFullYear() === end.getFullYear()) return `${fmtDM(start)}–${fmtDM(end)} ${end.getFullYear()}`;
  return `${fmtDMY(start)}–${fmtDMY(end)}`;
}

function inRange(tx: TransactionRecord, start: Date, end: Date): boolean {
  const t = new Date(tx.createdAt).getTime();
  return t >= start.getTime() && t < end.getTime();
}

/* ---------- core aggregation ---------- */

function summarize(current: TransactionRecord[], previous: TransactionRecord[], periodLabel: string): ReportSummary {
  const totalRevenue = current.reduce((s, t) => s + t.total, 0);
  const totalTransactions = current.length;
  const prevRevenue = previous.reduce((s, t) => s + t.total, 0);
  const prevCount = previous.length;

  const grossProfit = current.reduce(
    (s, t) => s + t.items.reduce((si, it) => si + (it.price - it.cost) * it.qty, 0),
    0,
  );
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // See file-level note: no expense tracking exists yet, so net = gross for now.
  const netProfit = grossProfit;
  const netMarginPct = grossMarginPct;

  const revenueTrendPct = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const transactionsTrendPct = prevCount > 0 ? ((totalTransactions - prevCount) / prevCount) * 100 : 0;

  return {
    periodLabel,
    totalRevenue,
    revenueTrendPct,
    totalTransactions,
    transactionsTrendPct,
    grossProfit,
    grossMarginPct,
    netProfit,
    netMarginPct,
  };
}

function topProducts(current: TransactionRecord[], limit = 8): ReportProductRow[] {
  const map = new Map<string, ReportProductRow>();
  for (const t of current) {
    for (const it of t.items) {
      const key = it.productId || it.name;
      const row = map.get(key) ?? { name: it.name, sold: 0, revenue: 0, profit: 0 };
      row.sold += it.qty;
      row.revenue += it.qty * it.price;
      row.profit += it.qty * (it.price - it.cost);
      map.set(key, row);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/** NOTE: trend `revenue` values are in THOUSANDS of IDR — laporan.tsx's chart
 * renders with a "rb" (ribu) suffix and multiplies by 1000 in its tooltip,
 * matching the convention the original mock data already used. */
function bucketedTrend(
  transactions: TransactionRecord[],
  count: number,
  bucketStart: (i: number) => Date,
  bucketEnd: (start: Date) => Date,
  label: (start: Date, i: number) => string,
): { label: string; revenue: number }[] {
  const points: { label: string; revenue: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = bucketStart(i);
    const end = bucketEnd(start);
    const revenue = transactions.filter((t) => inRange(t, start, end)).reduce((s, t) => s + t.total, 0);
    points.push({ label: label(start, i), revenue: Math.round(revenue / 1000) });
  }
  return points;
}

/* ---------- public API ---------- */

export function buildReportsByPeriod(transactions: TransactionRecord[]): Record<ReportPeriod, PeriodReportData> {
  const now = new Date();

  // Harian: hari ini vs kemarin, tren 14 hari terakhir.
  const todayStart = startOfDay(now);
  const todayEnd = addDays(todayStart, 1);
  const yestStart = addDays(todayStart, -1);
  const todayTx = transactions.filter((t) => inRange(t, todayStart, todayEnd));
  const yestTx = transactions.filter((t) => inRange(t, yestStart, todayStart));
  const harian: PeriodReportData = {
    summary: summarize(todayTx, yestTx, `Hari ini, ${fmtDMY(now)}`),
    trendTitle: "Tren Pendapatan (14 Hari Terakhir)",
    trend: bucketedTrend(
      transactions,
      14,
      (i) => addDays(todayStart, -i),
      (s) => addDays(s, 1),
      (_s, i) => (i === 0 ? "Ini" : `H-${i}`),
    ),
    topProducts: topProducts(todayTx),
  };

  // Mingguan: minggu berjalan (Senin–sekarang) vs minggu sebelumnya, tren 12 minggu.
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const prevWeekStart = addDays(weekStart, -7);
  const weekTx = transactions.filter((t) => inRange(t, weekStart, weekEnd));
  const prevWeekTx = transactions.filter((t) => inRange(t, prevWeekStart, weekStart));
  const mingguan: PeriodReportData = {
    summary: summarize(weekTx, prevWeekTx, `Minggu ini, ${fmtRange(weekStart, now)}`),
    trendTitle: "Tren Pendapatan (12 Minggu Terakhir)",
    trend: bucketedTrend(
      transactions,
      12,
      (i) => addDays(weekStart, -7 * i),
      (s) => addDays(s, 7),
      (_s, i) => (i === 0 ? "Ini" : `M-${i}`),
    ),
    topProducts: topProducts(weekTx),
  };

  // Bulanan: bulan kalender berjalan vs bulan lalu, tren 30 hari terakhir.
  const monthStart = startOfMonth(now);
  const monthEnd = addMonths(monthStart, 1);
  const prevMonthStart = addMonths(monthStart, -1);
  const monthTx = transactions.filter((t) => inRange(t, monthStart, monthEnd));
  const prevMonthTx = transactions.filter((t) => inRange(t, prevMonthStart, monthStart));
  const bulanan: PeriodReportData = {
    summary: summarize(monthTx, prevMonthTx, `${MONTH_FULL[monthStart.getMonth()]} ${monthStart.getFullYear()}`),
    trendTitle: "Tren Pendapatan (30 Hari)",
    trend: bucketedTrend(
      transactions,
      30,
      (i) => addDays(todayStart, -i),
      (s) => addDays(s, 1),
      (s) => String(s.getDate()),
    ),
    topProducts: topProducts(monthTx),
  };

  // Tahunan: tahun kalender berjalan vs tahun lalu, tren 12 bulan terakhir.
  const yearStart = startOfYear(now);
  const yearEnd = addMonths(yearStart, 12);
  const prevYearStart = addMonths(yearStart, -12);
  const yearTx = transactions.filter((t) => inRange(t, yearStart, yearEnd));
  const prevYearTx = transactions.filter((t) => inRange(t, prevYearStart, yearStart));
  const tahunan: PeriodReportData = {
    summary: summarize(yearTx, prevYearTx, `${yearStart.getFullYear()} (Jan–${MONTH_ABBR[now.getMonth()]})`),
    trendTitle: "Tren Pendapatan (12 Bulan Terakhir)",
    trend: bucketedTrend(
      transactions,
      12,
      (i) => addMonths(startOfMonth(now), -i),
      (s) => addMonths(s, 1),
      (s) => MONTH_ABBR[s.getMonth()],
    ),
    topProducts: topProducts(yearTx),
  };

  return { harian, mingguan, bulanan, tahunan };
}
