import { describe, it, expect } from "vitest";
import { formatIDR, formatCompactIDR, formatPercent, formatNumber } from "./format";

describe("format", () => {
  it("formatIDR memakai pemisah ribuan titik", () => {
    expect(formatIDR(25000)).toBe("Rp 25.000");
  });

  it("formatCompactIDR meringkas juta dan ribu", () => {
    expect(formatCompactIDR(1_200_000)).toBe("Rp 1,2 jt");
    expect(formatCompactIDR(25_000)).toBe("Rp 25rb");
    expect(formatCompactIDR(500)).toBe("Rp 500");
  });

  it("formatPercent memberi tanda + hanya untuk angka positif", () => {
    expect(formatPercent(12.4)).toBe("+12,4%");
    expect(formatPercent(-3.5)).toBe("-3,5%");
    expect(formatPercent(0)).toBe("0%");
  });

  it("formatNumber memakai pemisah ribuan Indonesia", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });
});
