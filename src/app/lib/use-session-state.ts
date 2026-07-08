import { useEffect, useState } from "react";

// Tracks which keys we've already handled the "fresh reload" clear for
// during this page load — without it we'd wipe the value again on every
// remount (e.g. every time the user tabs away to another page and back).
const reloadHandled = new Set<string>();

function isRealReload(): boolean {
  if (typeof performance === "undefined") return false;
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.type === "reload";
}

function readSession<T>(key: string, getFallback: () => T): T {
  if (typeof window === "undefined") return getFallback();

  // A hard refresh should still feel like a clean slate (same as before
  // this hook existed) — sessionStorage itself would otherwise survive
  // the reload too, since it only clears when the tab/window closes.
  if (isRealReload() && !reloadHandled.has(key)) {
    reloadHandled.add(key);
    window.sessionStorage.removeItem(key);
    return getFallback();
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : getFallback();
  } catch {
    return getFallback();
  }
}

/**
 * Drop-in replacement for useState that survives switching pages/tabs
 * in the app. React unmounts the component on every navigation, so a
 * plain useState resets — this mirrors the value into sessionStorage
 * (keyed by `key`) so it's still there when the component remounts.
 * Resets on an actual page refresh, or when the tab/window closes.
 *
 * `key` should be unique per call site, e.g. "rapikasir.laporan.cleared".
 * Like useState, `initialValue` can be a plain value or a lazy
 * `() => T` initializer for values that are expensive to compute.
 */
export function useSessionState<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() =>
    readSession(key, () => (typeof initialValue === "function" ? (initialValue as () => T)() : initialValue)),
  );

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable (e.g. private browsing) — state still
      // works for this render, it just won't survive a remount
    }
  }, [key, value]);

  return [value, setValue] as const;
}
