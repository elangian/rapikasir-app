import { Check, X, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "../components/ui/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useTier, type Tier, TIER_LABEL } from "../context/tier-context";
import { PLANS, FEATURE_MATRIX, type Plan } from "../data/mock-data";
import { toast } from "sonner";

export function Pricing() {
  const { tier, setTier } = useTier();
  const navigate = useNavigate();

  const choose = (plan: Plan) => {
    if (plan.price > 0) {
      navigate(`/pembayaran?plan=${plan.tier}`);
      return;
    }
    setTier(plan.tier);
    toast.success(`Paket ${plan.name} aktif`, {
      description: "Mode demo — fitur di seluruh aplikasi ikut menyesuaikan.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1 rounded-md border-2 border-border bg-block-amber px-3 py-1 text-xs font-semibold">
          Paket & Harga
        </span>
        <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          Pilih paket yang tumbuh bersama usahamu
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mulai gratis, upgrade kapan saja. Catat transaksi & kelola usaha lebih rapi.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const active = tier === plan.tier;
          return (
            <div
              key={plan.tier}
              className={cn(
                "relative flex flex-col rounded-md border-2 border-border p-6 transition-all duration-150",
                plan.dark ? "bg-primary text-primary-foreground" : "bg-card",
                plan.highlight && "shadow-brutal border-secondary",
                active && "ring-2 ring-accent ring-offset-2 ring-offset-background",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border-2 border-border bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground">
                  <Star className="size-3 fill-current" /> Paling Populer
                </span>
              )}

              <p className="font-display text-lg font-bold">{plan.name}</p>
              <p className={cn("text-sm", plan.dark ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {plan.tagline}
              </p>

              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-3xl font-extrabold">{plan.priceLabel}</span>
                {plan.price > 0 && (
                  <span className={cn("mb-1 text-sm", plan.dark ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    /bulan
                  </span>
                )}
              </div>

              <button
                onClick={() => choose(plan)}
                disabled={active}
                className={cn(
                  "press-scale mt-5 rounded-md border-2 border-border py-2.5 text-sm font-semibold transition-colors duration-150",
                  active
                    ? "cursor-default bg-block-green text-foreground"
                    : plan.highlight || plan.dark
                      ? "bg-accent text-accent-foreground shadow-brutal-sm"
                      : "bg-card text-foreground hover:bg-block-amber",
                )}
              >
                {active ? "Paket Aktif" : plan.cta}
              </button>

              {/* Feature highlights */}
              <ul className="mt-5 space-y-2 text-sm">
                {FEATURE_MATRIX.slice(0, 8).map((row) => {
                  const v = row.values[plan.tier];
                  const enabled = v !== false;
                  return (
                    <li key={row.label} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border",
                          enabled
                            ? "border-success bg-success text-success-foreground"
                            : plan.dark
                              ? "border-primary-foreground/30 text-primary-foreground/40"
                              : "border-border text-muted-foreground",
                        )}
                      >
                        {enabled ? <Check className="size-3" /> : <X className="size-3" />}
                      </span>
                      <span className={cn(!enabled && (plan.dark ? "text-primary-foreground/50" : "text-muted-foreground"))}>
                        {row.label}
                        {typeof v === "string" && <span className="font-semibold"> — {v}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="rounded-md border-2 border-border bg-card">
        <div className="border-b-2 border-border px-5 py-4">
          <h2 className="font-display">Perbandingan Lengkap Fitur</h2>
          <p className="text-sm text-muted-foreground">Semua fitur RapiKasir di setiap paket.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="min-w-[180px]">Fitur</TableHead>
                {(["FREE", "TRIAL", "PRO", "BUSINESS"] as Tier[]).map((t) => (
                  <TableHead key={t} className="text-center">
                    <span
                      className={cn(
                        "inline-block rounded-md border-2 border-border px-2 py-0.5 text-xs font-bold",
                        tier === t ? "bg-accent text-accent-foreground" : "bg-background",
                      )}
                    >
                      {TIER_LABEL[t]}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURE_MATRIX.map((row) => (
                <TableRow key={row.label} className="border-border/60">
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {(["FREE", "TRIAL", "PRO", "BUSINESS"] as Tier[]).map((t) => {
                    const v = row.values[t];
                    return (
                      <TableCell key={t} className="text-center">
                        {v === true ? (
                          <Check className="mx-auto size-4 text-success" />
                        ) : v === false ? (
                          <X className="mx-auto size-4 text-muted-foreground/50" />
                        ) : (
                          <span className="text-sm font-medium">{v}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
