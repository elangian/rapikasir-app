import type { Tier } from "../context/tier-context";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
}

export interface Transaction {
  id: string;
  time: string;
  item: string;
  itemsCount: number;
  total: number;
  method: "Cash" | "Transfer" | "QRIS";
}

export const STORE_NAME = "Warung Bu Sari";
export const OWNER_NAME = "Sari Wulandari";

export const CATEGORIES = ["Semua", "Makanan", "Minuman", "Snack", "Sembako", "ATK"];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Kopi Susu Gula Aren", category: "Minuman", price: 18000, cost: 9000, stock: 42 },
  { id: "p2", name: "Nasi Goreng Spesial", category: "Makanan", price: 22000, cost: 12000, stock: 30 },
  { id: "p3", name: "Es Teh Manis", category: "Minuman", price: 5000, cost: 1500, stock: 120 },
  { id: "p4", name: "Mie Ayam Bakso", category: "Makanan", price: 20000, cost: 11000, stock: 25 },
  { id: "p5", name: "Ayam Geprek Sambal", category: "Makanan", price: 23000, cost: 13000, stock: 3 },
  { id: "p6", name: "Roti Bakar Coklat", category: "Snack", price: 15000, cost: 7000, stock: 18 },
  { id: "p7", name: "Teh Tarik Hangat", category: "Minuman", price: 12000, cost: 5000, stock: 60 },
  { id: "p8", name: "Kentang Goreng", category: "Snack", price: 14000, cost: 6000, stock: 2 },
  { id: "p9", name: "Minyak Goreng 1L", category: "Sembako", price: 19000, cost: 16000, stock: 40 },
  { id: "p10", name: "Beras Premium 5kg", category: "Sembako", price: 72000, cost: 63000, stock: 12 },
  { id: "p11", name: "Gula Pasir 1kg", category: "Sembako", price: 15000, cost: 12500, stock: 4 },
  { id: "p12", name: "Pulpen Gel Hitam", category: "ATK", price: 4000, cost: 2000, stock: 85 },
  { id: "p13", name: "Buku Tulis 38 lbr", category: "ATK", price: 6000, cost: 3500, stock: 50 },
  { id: "p14", name: "Jus Alpukat", category: "Minuman", price: 17000, cost: 8000, stock: 22 },
  { id: "p15", name: "Pisang Goreng (5 pcs)", category: "Snack", price: 10000, cost: 4000, stock: 1 },
  { id: "p16", name: "Soto Ayam Kampung", category: "Makanan", price: 21000, cost: 12000, stock: 16 },
  { id: "p17", name: "Ayam Bakar Madu", category: "Makanan", price: 25000, cost: 14000, stock: 8 },
  { id: "p18", name: "Es Kopi Americano", category: "Minuman", price: 15000, cost: 6000, stock: 35 },
  { id: "p19", name: "Lumpia Semarang", category: "Snack", price: 12000, cost: 5000, stock: 14 },
  { id: "p20", name: "Telur Ayam 1kg", category: "Sembako", price: 28000, cost: 24000, stock: 20 },
  { id: "p21", name: "Tepung Terigu 1kg", category: "Sembako", price: 13000, cost: 10000, stock: 30 },
  { id: "p22", name: "Spidol Whiteboard", category: "ATK", price: 8000, cost: 4000, stock: 40 },
  { id: "p23", name: "Kertas HVS A4 rim", category: "ATK", price: 52000, cost: 45000, stock: 9 },
  { id: "p24", name: "Nasi Uduk Komplit", category: "Makanan", price: 18000, cost: 9000, stock: 22 },
  { id: "p25", name: "Matcha Latte", category: "Minuman", price: 20000, cost: 9000, stock: 3 },
  { id: "p26", name: "Cireng Isi (6 pcs)", category: "Snack", price: 11000, cost: 4500, stock: 26 },
  { id: "p27", name: "Sabun Cuci Piring", category: "Sembako", price: 9000, cost: 6500, stock: 45 },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: "TRX-1042", time: "14:32", item: "Kopi Susu Gula Aren", itemsCount: 3, total: 54000, method: "QRIS" },
  { id: "TRX-1041", time: "14:18", item: "Nasi Goreng Spesial", itemsCount: 2, total: 44000, method: "Cash" },
  { id: "TRX-1040", time: "13:55", item: "Es Teh Manis", itemsCount: 5, total: 25000, method: "Cash" },
  { id: "TRX-1039", time: "13:40", item: "Ayam Geprek Sambal", itemsCount: 1, total: 23000, method: "Transfer" },
  { id: "TRX-1038", time: "13:12", item: "Mie Ayam Bakso", itemsCount: 2, total: 40000, method: "QRIS" },
  { id: "TRX-1037", time: "12:47", item: "Roti Bakar Coklat", itemsCount: 4, total: 60000, method: "Cash" },
  { id: "TRX-1036", time: "12:30", item: "Beras Premium 5kg", itemsCount: 1, total: 72000, method: "Transfer" },
  { id: "TRX-1035", time: "12:05", item: "Teh Tarik Hangat", itemsCount: 3, total: 36000, method: "QRIS" },
];

export const TOP_PRODUCTS = [
  { name: "Kopi Susu Gula Aren", sold: 48 },
  { name: "Es Teh Manis", sold: 41 },
  { name: "Nasi Goreng Spesial", sold: 33 },
  { name: "Mie Ayam Bakso", sold: 27 },
  { name: "Ayam Geprek Sambal", sold: 22 },
];

/** Hourly revenue sparkline for today (in thousands of IDR). */
export const REVENUE_SPARKLINE = [
  { h: "08", v: 120 },
  { h: "09", v: 210 },
  { h: "10", v: 180 },
  { h: "11", v: 340 },
  { h: "12", v: 520 },
  { h: "13", v: 480 },
  { h: "14", v: 610 },
];

export const DASHBOARD_METRICS = {
  revenueToday: 2842000,
  revenueTrendPct: 12.4,
  transactionsToday: 68,
  transactionsTrendPct: 8.1,
  activeProducts: 23,
  productLimitFree: 30,
};

export const LOW_STOCK = PRODUCTS.filter((p) => p.stock < 5).sort((a, b) => a.stock - b.stock);

/** 30-day revenue trend for the Laporan screen (in thousands of IDR). */
export const REVENUE_TREND_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 2200 + Math.sin(i / 3) * 400 + i * 22;
  return { day: i + 1, revenue: Math.round(base + (i % 7 === 0 ? 350 : 0)) };
});

/* ---------- Laporan (monthly report) ---------- */

export const REPORT_SUMMARY = {
  periodLabel: "Juni 2026",
  totalRevenue: 84560000,
  revenueTrendPct: 14.2,
  totalTransactions: 1842,
  transactionsTrendPct: 9.6,
  grossProfit: 33820000, // laba kotor
  grossMarginPct: 40.0,
  netProfit: 21450000, // laba bersih
  netMarginPct: 25.4,
};

export interface ReportProductRow {
  name: string;
  sold: number;
  revenue: number;
  profit: number;
}

export const REPORT_TOP_PRODUCTS: ReportProductRow[] = [
  { name: "Kopi Susu Gula Aren", sold: 612, revenue: 11016000, profit: 5508000 },
  { name: "Nasi Goreng Spesial", sold: 428, revenue: 9416000, profit: 4280000 },
  { name: "Es Teh Manis", sold: 980, revenue: 4900000, profit: 3430000 },
  { name: "Ayam Geprek Sambal", sold: 356, revenue: 8188000, profit: 3560000 },
  { name: "Mie Ayam Bakso", sold: 301, revenue: 6020000, profit: 2709000 },
  { name: "Beras Premium 5kg", sold: 142, revenue: 10224000, profit: 1278000 },
];

/* ---------- Pricing ---------- */

export interface Plan {
  tier: Tier;
  name: string;
  tagline: string;
  price: number; // 0 for free/trial
  priceLabel: string;
  cta: string;
  highlight?: boolean;
  dark?: boolean;
}

export const PLANS: Plan[] = [
  {
    tier: "FREE",
    name: "Free",
    tagline: "Gratis, untuk mulai digitalisasi",
    price: 0,
    priceLabel: "Rp 0",
    cta: "Mulai Sekarang",
  },
  {
    tier: "TRIAL",
    name: "Trial Pro",
    tagline: "Coba gratis 1 bulan",
    price: 0,
    priceLabel: "Rp 0",
    cta: "Coba Gratis",
  },
  {
    tier: "PRO",
    name: "Pro",
    tagline: "Untuk UMKM aktif",
    price: 25000,
    priceLabel: "Rp 25.000",
    cta: "Pilih Pro",
    highlight: true,
  },
  {
    tier: "BUSINESS",
    name: "Business",
    tagline: "Untuk UMKM berkembang",
    price: 75000,
    priceLabel: "Rp 75.000",
    cta: "Pilih Business",
    dark: true,
  },
];

export interface FeatureRow {
  label: string;
  values: Record<Tier, string | boolean>;
}

export const FEATURE_MATRIX: FeatureRow[] = [
  { label: "Maksimal produk", values: { FREE: "30", TRIAL: "300", PRO: "500", BUSINESS: "Unlimited" } },
  { label: "Transaksi / bulan", values: { FREE: "100", TRIAL: "Tinggi", PRO: "Unlimited", BUSINESS: "Unlimited" } },
  { label: "Pencatatan kasir", values: { FREE: true, TRIAL: true, PRO: true, BUSINESS: true } },
  { label: "Manajemen stok", values: { FREE: "Lihat saja", TRIAL: true, PRO: true, BUSINESS: true } },
  { label: "Laporan bulanan", values: { FREE: false, TRIAL: true, PRO: true, BUSINESS: true } },
  { label: "Laba kotor", values: { FREE: false, TRIAL: true, PRO: true, BUSINESS: true } },
  { label: "Laba bersih", values: { FREE: false, TRIAL: "Terbatas", PRO: true, BUSINESS: "Detail" } },
  { label: "Export Excel / PDF", values: { FREE: false, TRIAL: true, PRO: true, BUSINESS: "Custom range" } },
  { label: "Diskon transaksi", values: { FREE: false, TRIAL: false, PRO: true, BUSINESS: true } },
  { label: "Pembayaran QRIS", values: { FREE: false, TRIAL: false, PRO: false, BUSINESS: true } },
  { label: "Multi-user", values: { FREE: false, TRIAL: false, PRO: "2 user", BUSINESS: "Full + role" } },
  { label: "Multi-cabang", values: { FREE: false, TRIAL: false, PRO: false, BUSINESS: true } },
  { label: "Support", values: { FREE: "Basic", TRIAL: "Basic", PRO: "Standard", BUSINESS: "Prioritas" } },
];

// ---------- Pre-login / onboarding data (landing, register, onboarding) ----------

export interface StoreCategory {
  key: string;
  label: string;
  icon: string; // lucide icon name
}

export const STORE_CATEGORIES: StoreCategory[] = [
  { key: "warung", label: "Warung Makan", icon: "utensils-crossed" },
  { key: "kopi", label: "Kedai Kopi", icon: "coffee" },
  { key: "kelontong", label: "Toko Kelontong", icon: "shopping-basket" },
  { key: "laundry", label: "Laundry", icon: "shirt" },
  { key: "atk", label: "Toko ATK", icon: "pencil-ruler" },
  { key: "retail", label: "Retail / Butik", icon: "shopping-bag" },
  { key: "bengkel", label: "Bengkel", icon: "wrench" },
  { key: "lainnya", label: "Lainnya", icon: "ellipsis" },
];

export interface ProductQtyOption {
  key: string;
  label: string;
}

export const PRODUCT_QTY_OPTIONS: ProductQtyOption[] = [
  { key: "lt10", label: "Kurang dari 10 produk" },
  { key: "10-30", label: "10 sampai 30 produk" },
  { key: "30-100", label: "30 sampai 100 produk" },
  { key: "gt100", label: "Lebih dari 100 produk" },
];

export const TESTIMONIALS = [
  {
    initial: "R",
    initialBg: "bg-block-amber",
    quote:
      "Dulu tutup toko malam hari aku masih harus hitung uang manual. Sekarang tinggal buka laporan, semua sudah rapi.",
    name: "Rina Setiawati",
    role: "Warung Nasi Bu Tuti, Bandung",
  },
  {
    initial: "D",
    initialBg: "bg-block-green",
    quote: "Fitur stoknya paling kepakai. Aku jadi tahu kapan harus belanja bahan lagi sebelum kehabisan.",
    name: "Dimas Aditya",
    role: "Laundry Kilat Bersih, Surabaya",
  },
  {
    initial: "S",
    initialBg: "bg-block-amber",
    quote: "Karyawan baru bisa langsung pakai kasirnya tanpa banyak diajarin. Tampilannya jelas dan cepat.",
    name: "Sari Wulandari",
    role: "Warung Bu Sari, Jakarta",
  },
];

// ---------- Payment / checkout (upgrade paket) ----------

export interface PaymentMethodOption {
  key: string;
  label: string;
}

export const EWALLET_METHODS: PaymentMethodOption[] = [
  { key: "gopay", label: "GoPay" },
  { key: "ovo", label: "OVO" },
  { key: "dana", label: "DANA" },
];

export const BANK_METHODS: PaymentMethodOption[] = [
  { key: "bca", label: "BCA" },
  { key: "mandiri", label: "Mandiri" },
  { key: "bri", label: "BRI" },
  { key: "bni", label: "BNI" },
];

// ---------- Admin (internal tool) mock data ----------

export const ADMIN_USERS = [
  { store: "Kedai Kopi Senja", email: "kopisenja.id@gmail.com", tier: "PRO" as Tier, date: "12 Mei 2026", status: "aktif" as const },
  { store: "Toko Kelontong Makmur Jaya", email: "makmurjaya.toko@gmail.com", tier: "FREE" as Tier, date: "03 Jun 2026", status: "aktif" as const },
  { store: "Laundry Kilat Bersih", email: "laundrykilat.bersih@gmail.com", tier: "BUSINESS" as Tier, date: "18 Feb 2026", status: "aktif" as const },
  { store: "Warung Nasi Bu Tuti", email: "warungbututi88@gmail.com", tier: "FREE" as Tier, date: "27 Jun 2026", status: "aktif" as const },
  { store: "Bengkel Motor Jaya Abadi", email: "jayaabadi.motor@gmail.com", tier: "PRO" as Tier, date: "09 Apr 2026", status: "nonaktif" as const },
  { store: "Toko ATK Cerdas", email: "cerdasatk.toko@gmail.com", tier: "TRIAL" as Tier, date: "25 Jun 2026", status: "aktif" as const },
  { store: "Butik Zahra Collection", email: "zahracollection.id@gmail.com", tier: "BUSINESS" as Tier, date: "14 Jan 2026", status: "aktif" as const },
  { store: "Kopi Kita Roastery", email: "kopikita.roastery@gmail.com", tier: "PRO" as Tier, date: "30 Mar 2026", status: "aktif" as const },
  { store: "Sembako Sumber Rejeki", email: "sumberrejeki.sembako@gmail.com", tier: "FREE" as Tier, date: "20 Jun 2026", status: "nonaktif" as const },
  { store: "Dapur Ibu Endang", email: "dapuribuendang@gmail.com", tier: "FREE" as Tier, date: "01 Jul 2026", status: "aktif" as const },
  { store: "Toko Elektronik Cahaya", email: "cahayaelektronik.toko@gmail.com", tier: "PRO" as Tier, date: "22 Mei 2026", status: "aktif" as const },
  { store: "Percetakan Warna Digital", email: "warnadigital.print@gmail.com", tier: "BUSINESS" as Tier, date: "05 Mar 2026", status: "aktif" as const },
];

export const ADMIN_TRANSACTIONS = [
  { time: "02 Jul 2026, 09:14", store: "Kedai Kopi Senja", tier: "PRO" as Tier, amount: 25000, method: "GoPay", status: "sukses" as const },
  { time: "02 Jul 2026, 08:52", store: "Butik Zahra Collection", tier: "BUSINESS" as Tier, amount: 75000, method: "BCA", status: "sukses" as const },
  { time: "02 Jul 2026, 08:30", store: "Toko Elektronik Cahaya", tier: "PRO" as Tier, amount: 25000, method: "DANA", status: "pending" as const },
  { time: "01 Jul 2026, 22:47", store: "Bengkel Motor Jaya Abadi", tier: "PRO" as Tier, amount: 25000, method: "OVO", status: "gagal" as const },
  { time: "01 Jul 2026, 19:15", store: "Dapur Ibu Endang", tier: "PRO" as Tier, amount: 25000, method: "Mandiri", status: "sukses" as const },
  { time: "01 Jul 2026, 16:03", store: "Laundry Kilat Bersih", tier: "BUSINESS" as Tier, amount: 75000, method: "BRI", status: "sukses" as const },
  { time: "01 Jul 2026, 14:28", store: "Kopi Kita Roastery", tier: "PRO" as Tier, amount: 25000, method: "GoPay", status: "sukses" as const },
  { time: "01 Jul 2026, 11:52", store: "Percetakan Warna Digital", tier: "BUSINESS" as Tier, amount: 75000, method: "BNI", status: "pending" as const },
  { time: "30 Jun 2026, 20:10", store: "Toko Kue Manis Legit", tier: "PRO" as Tier, amount: 25000, method: "DANA", status: "sukses" as const },
  { time: "30 Jun 2026, 17:36", store: "Apotek Sehat Keluarga", tier: "BUSINESS" as Tier, amount: 75000, method: "BCA", status: "gagal" as const },
];

// ---------- Laporan: 4 mode periode (Harian / Mingguan / Bulanan / Tahunan) ----------

export interface ReportSummary {
  periodLabel: string;
  totalRevenue: number;
  revenueTrendPct: number;
  totalTransactions: number;
  transactionsTrendPct: number;
  grossProfit: number;
  grossMarginPct: number;
  netProfit: number;
  netMarginPct: number;
}

export type ReportPeriod = "harian" | "mingguan" | "bulanan" | "tahunan";

export interface PeriodReportData {
  summary: ReportSummary;
  trend: { label: string; revenue: number }[];
  trendTitle: string;
  topProducts: ReportProductRow[];
}

export const DAILY_REPORT: PeriodReportData = {
  summary: {
    periodLabel: "Hari ini, 2 Jul 2026",
    totalRevenue: 2850000,
    revenueTrendPct: 6.5,
    totalTransactions: 64,
    transactionsTrendPct: 4.0,
    grossProfit: 1140000,
    grossMarginPct: 40.0,
    netProfit: 723900,
    netMarginPct: 25.4,
  },
  trendTitle: "Tren Pendapatan (14 Hari Terakhir)",
  trend: Array.from({ length: 14 }, (_, i) => ({
    label: i === 13 ? "Ini" : `H-${13 - i}`,
    revenue: Math.round(2500 + Math.sin(i / 2) * 300 + i * 15),
  })),
  topProducts: [
    { name: "Kopi Susu Gula Aren", sold: 22, revenue: 396000, profit: 198000 },
    { name: "Es Teh Manis", sold: 34, revenue: 170000, profit: 119000 },
    { name: "Nasi Goreng Spesial", sold: 15, revenue: 330000, profit: 150000 },
    { name: "Ayam Geprek Sambal", sold: 12, revenue: 276000, profit: 120000 },
    { name: "Mie Ayam Bakso", sold: 10, revenue: 200000, profit: 90000 },
  ],
};

export const WEEKLY_REPORT: PeriodReportData = {
  summary: {
    periodLabel: "Minggu ini, 29 Jun–2 Jul 2026",
    totalRevenue: 19800000,
    revenueTrendPct: 8.1,
    totalTransactions: 431,
    transactionsTrendPct: 5.3,
    grossProfit: 7920000,
    grossMarginPct: 40.0,
    netProfit: 5029200,
    netMarginPct: 25.4,
  },
  trendTitle: "Tren Pendapatan (12 Minggu Terakhir)",
  trend: Array.from({ length: 12 }, (_, i) => ({
    label: i === 11 ? "Ini" : `M-${11 - i}`,
    revenue: Math.round(16000 + Math.sin(i / 2) * 2200 + i * 350),
  })),
  topProducts: [
    { name: "Kopi Susu Gula Aren", sold: 148, revenue: 2664000, profit: 1332000 },
    { name: "Nasi Goreng Spesial", sold: 102, revenue: 2244000, profit: 1020000 },
    { name: "Es Teh Manis", sold: 230, revenue: 1150000, profit: 805000 },
    { name: "Ayam Geprek Sambal", sold: 84, revenue: 1932000, profit: 840000 },
    { name: "Mie Ayam Bakso", sold: 70, revenue: 1400000, profit: 630000 },
  ],
};

export const YEARLY_REPORT: PeriodReportData = {
  summary: {
    periodLabel: "2026 (Jan–Jun)",
    totalRevenue: 458000000,
    revenueTrendPct: 22.5,
    totalTransactions: 9850,
    transactionsTrendPct: 18.0,
    grossProfit: 183200000,
    grossMarginPct: 40.0,
    netProfit: 116332000,
    netMarginPct: 25.4,
  },
  trendTitle: "Tren Pendapatan (12 Bulan Terakhir)",
  trend: ["Jul", "Ags", "Sep", "Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun"].map((label, i) => ({
    label,
    revenue: Math.round(28000 + Math.sin(i / 3) * 4000 + i * 2600),
  })),
  topProducts: [
    { name: "Kopi Susu Gula Aren", sold: 6280, revenue: 113040000, profit: 56520000 },
    { name: "Nasi Goreng Spesial", sold: 4380, revenue: 96360000, profit: 43800000 },
    { name: "Es Teh Manis", sold: 9860, revenue: 49300000, profit: 34510000 },
    { name: "Ayam Geprek Sambal", sold: 3640, revenue: 83720000, profit: 36400000 },
    { name: "Mie Ayam Bakso", sold: 3080, revenue: 61600000, profit: 27720000 },
    { name: "Beras Premium 5kg", sold: 1420, revenue: 102240000, profit: 12780000 },
  ],
};

export const MONTHLY_REPORT: PeriodReportData = {
  summary: REPORT_SUMMARY,
  trendTitle: "Tren Pendapatan (30 Hari)",
  trend: REVENUE_TREND_30D.map((p) => ({ label: String(p.day), revenue: p.revenue })),
  topProducts: REPORT_TOP_PRODUCTS,
};

export const REPORTS_BY_PERIOD: Record<ReportPeriod, PeriodReportData> = {
  harian: DAILY_REPORT,
  mingguan: WEEKLY_REPORT,
  bulanan: MONTHLY_REPORT,
  tahunan: YEARLY_REPORT,
};

export const REPORT_PERIOD_LABEL: Record<ReportPeriod, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
  tahunan: "Tahunan",
};
