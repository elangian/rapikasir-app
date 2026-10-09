import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { AdminGate } from "./admin-gate";

it("does not grant admin access with legacy session unlock or a build-time passphrase", () => {
  const getItem = vi.fn(() => "1");
  vi.stubGlobal("sessionStorage", { getItem });
  vi.stubEnv("VITE_ADMIN_PASSPHRASE", "test-only-not-a-secret");
  try {
    const markup = renderToStaticMarkup(<AdminGate />);
    expect(markup).toContain("Akses admin ditutup sementara");
    expect(markup).not.toContain("test-only-not-a-secret");
    expect(markup).not.toContain("<form");
    expect(getItem).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs(); }
});
