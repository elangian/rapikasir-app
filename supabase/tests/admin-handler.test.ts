import { describe, expect, it, vi } from "vitest";
import { createAdminHandler, type AdminDependencies } from "../functions/admin/handler";

const ACTOR = "11111111-1111-4111-8111-111111111111";
const STORE = "22222222-2222-4222-8222-222222222222";
const origin = "https://app.example.com";
function fixture(overrides: Partial<AdminDependencies> = {}) {
  const deps = {
    allowedOrigins: [origin], verifyUser: vi.fn(async () => ACTOR),
    listStores: vi.fn(async () => ({ data: [], error: null })),
    setTier: vi.fn(async () => ({ data: { storeId: STORE, tier: "PRO" }, error: null })),
    ...overrides,
  };
  return { deps, handler: createAdminHandler(deps) };
}
function patch(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://backend.example/admin", { method: "PATCH", headers: { authorization: "Bearer fake-test-session", origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
}
const input = { storeId: STORE, tier: "PRO", reason: "Approved manual assignment" };

describe("admin request authorization", () => {
  it("rejects missing and invalid sessions before any privileged RPC", async () => {
    const { handler, deps } = fixture({ verifyUser: vi.fn(async () => null) });
    expect((await handler(new Request("https://backend.example/admin"))).status).toBe(401);
    expect((await handler(patch(input))).status).toBe(401);
    expect(deps.setTier).not.toHaveBeenCalled();
    expect(deps.listStores).not.toHaveBeenCalled();
  });
  it("takes actor identity only from verified Auth and requires server-side role approval", async () => {
    const { handler, deps } = fixture();
    const result = await handler(patch(input));
    expect(result.status).toBe(200);
    expect(deps.verifyUser).toHaveBeenCalledWith("fake-test-session");
    expect(deps.setTier).toHaveBeenCalledWith(ACTOR, STORE, "PRO", input.reason);
    expect((await handler(patch({ ...input, actorId: STORE }))).status).toBe(400);
    const denied = fixture({ setTier: vi.fn(async () => ({ data: null, error: { code: "42501" } })) });
    expect((await denied.handler(patch(input))).status).toBe(403);
  });
  it("does not treat allowed CORS or a forged admin payload as authorization", async () => {
    const { handler, deps } = fixture();
    expect((await handler(patch(input, { origin: "https://attacker.example" }))).status).toBe(403);
    expect(deps.verifyUser).not.toHaveBeenCalled();
    expect((await handler(patch(input, { authorization: "" }))).status).toBe(401);
    const preflight = await handler(new Request("https://backend.example/admin", { method: "OPTIONS", headers: { origin } }));
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe(origin);
    expect(deps.setTier).not.toHaveBeenCalled();
  });
  it.each([{ ...input, tier: "UNKNOWN" }, { ...input, storeId: "not-a-uuid" }, { ...input, reason: "short" }, { ...input, role: "admin" }, null, []])("rejects malformed privileged input %j", async (body) => {
    const { handler, deps } = fixture();
    expect((await handler(patch(body))).status).toBe(400);
    expect(deps.setTier).not.toHaveBeenCalled();
  });
  it("bounds request size and rejects non-JSON and malformed JSON", async () => {
    const { handler, deps } = fixture();
    expect((await handler(patch({ ...input, reason: "x".repeat(5000) }))).status).toBe(413);
    expect((await handler(patch(input, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await handler(new Request("https://backend.example/admin", { method: "PATCH", headers: { authorization: "Bearer test", "content-type": "application/json" }, body: "{" }))).status).toBe(400);
    expect(deps.setTier).not.toHaveBeenCalled();
  });
  it("validates pagination and never allows client-selected identity in list requests", async () => {
    const { handler, deps } = fixture();
    const headers = { authorization: "Bearer test" };
    expect((await handler(new Request("https://backend.example/admin?offset=2&limit=10", { headers }))).status).toBe(200);
    expect(deps.listStores).toHaveBeenCalledWith(ACTOR, 2, 10);
    for (const query of ["limit=1000", "offset=-1", "limit=NaN", `actorId=${STORE}`]) {
      expect((await handler(new Request(`https://backend.example/admin?${query}`, { headers }))).status).toBe(400);
    }
    expect(deps.listStores).toHaveBeenCalledTimes(1);
  });
  it("maps rate limits and backend errors without disclosing credentials or response bodies", async () => {
    const limited = fixture({ setTier: vi.fn(async () => ({ data: null, error: { code: "P4290" } })) });
    expect((await limited.handler(patch(input))).status).toBe(429);
    const failed = fixture({ verifyUser: vi.fn(async () => { throw new Error("secret backend details"); }) });
    const result = await failed.handler(patch(input));
    expect(result.status).toBe(503);
    expect(await result.text()).not.toContain("secret backend details");
    expect(result.headers.get("cache-control")).toBe("no-store");
  });
});
