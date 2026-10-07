/** Format a number as Indonesian Rupiah, e.g. 25000 -> "Rp 25.000". */
export function formatIDR(value: number): string {
  return "Rp" + Math.round(value).toLocaleString("id-ID");
}

/** Format a number compactly, e.g. 1200000 -> "1,2 jt". */
export function formatCompactIDR(value: number): string {
  if (value >= 1_000_000) {
    return "Rp " + (value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
  }
  if (value >= 1_000) {
    return "Rp " + (value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + "rb";
  }
  return formatIDR(value);
}

/** Format a signed percentage, e.g. 12.4 -> "+12,4%". */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return sign + value.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";
}

/** Format a plain integer with Indonesian thousands separators. */
export function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}
