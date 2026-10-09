import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { formatIDR } from "../lib/format";

const PLANS = {
  PRO: { name: "Paket Pro", price: 25000, features: ["500 produk", "Transaksi tanpa batas", "Laporan laba lengkap", "Diskon transaksi"] },
  BUSINESS: { name: "Paket Business", price: 75000, features: ["Produk tanpa batas", "Multi-cabang", "QRIS & multi-user", "Dukungan prioritas"] },
};

export function Payment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = params.get("plan")?.toUpperCase() === "BUSINESS" ? PLANS.BUSINESS : PLANS.PRO;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b-2 border-border px-5 py-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm">
          <ArrowLeft className="size-4" /> Kembali
        </button>
      </header>
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-8">
        <h1 className="font-display text-2xl font-bold">Upgrade Paket</h1>
        <div className="rounded-lg border-2 border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold">{plan.name}</h2>
          <p className="mt-2 text-lg">{formatIDR(plan.price)} / bulan</p>
          <ul className="mt-4 space-y-2 text-sm">
            {plan.features.map((feature) => <li key={feature} className="flex items-center gap-2"><Check className="size-4" />{feature}</li>)}
          </ul>
        </div>
        <p role="status" className="rounded-lg border-2 border-border bg-block-amber p-5 text-sm">
          Pembayaran dan aktivasi paket online belum tersedia. Jangan mengirim pembayaran.
          Hubungi pengelola RapiKasir untuk informasi paket. Paket aktif Anda tetap berlaku.
        </p>
        <button onClick={() => navigate("/paket")} className="rounded-md border-2 border-border bg-accent px-5 py-3 text-sm font-semibold">
          Kembali ke daftar paket
        </button>
      </main>
    </div>
  );
}
