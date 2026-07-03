import { Link } from "react-router";
import { Infinity as InfinityIcon } from "lucide-react";
import { cn } from "../ui/utils";
import { useTier } from "../../context/tier-context";
import { PRODUCTS } from "../../data/mock-data";

/** Number of products currently in use across the app. */
export function useProductUsage() {
  const { productLimit } = useTier();
  const used = PRODUCTS.length;
  const unlimited = !Number.isFinite(productLimit);
  const ratio = unlimited ? 0 : used / productLimit;
  const level: "ok" | "warn" | "full" = ratio >= 0.9 ? "full" : ratio >= 0.75 ? "warn" : "ok";
  return { used, limit: productLimit, unlimited, ratio, level };
}

const BAR_COLOR: Record<"ok" | "warn" | "full", string> = {
  ok: "bg-success",
  warn: "bg-accent",
  full: "bg-destructive",
};

interface ProductLimitProps {
  /** Compact variant for the sidebar (smaller text, dark surface). */
  variant?: "default" | "sidebar";
  showUpgrade?: boolean;
  className?: string;
}

export function ProductLimit({ variant = "default", showUpgrade = false, className }: ProductLimitProps) {
  const { used, limit, unlimited, ratio, level } = useProductUsage();
  const sidebar = variant === "sidebar";

  if (unlimited) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-sm font-medium",
          sidebar ? "border-sidebar-border bg-sidebar-accent" : "border-border bg-block-green",
          className,
        )}
      >
        <InfinityIcon className="size-4" />
        <span>{used} produk • tanpa batas</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-sm font-medium", sidebar && "text-sidebar-foreground/90")}>
          <span className="font-semibold">{used}</span>
          <span className={sidebar ? "text-sidebar-foreground/60" : "text-muted-foreground"}>
            {" "}dari {limit} produk
          </span>
        </span>
        {showUpgrade && level !== "ok" && (
          <Link
            to="/paket"
            className="press-scale rounded-md border-2 border-border bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground"
          >
            Upgrade
          </Link>
        )}
      </div>
      <div
        className={cn(
          "h-2.5 w-full overflow-hidden rounded-md border-2",
          sidebar ? "border-sidebar-border bg-sidebar" : "border-border bg-background",
        )}
      >
        <div
          className={cn("h-full transition-all duration-300", BAR_COLOR[level])}
          style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
        />
      </div>
      {level === "full" && (
        <p className={cn("text-xs font-medium text-destructive", sidebar && "text-destructive")}>
          Kuota hampir penuh — upgrade untuk tambah produk.
        </p>
      )}
    </div>
  );
}
