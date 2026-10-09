import { describe, expect, it, vi } from "vitest";
import { checkSite, checkSupabase, request } from "./smoke.mjs";

const html = '<html><title>RapiKasir</title><div id="root"></div><script src="/assets/app.js"></script><link href="/assets/app.css"></html>';
const response = (status, body = "", type = "application/json") => new Response(body, { status, headers: { "content-type": type } });
const options = (fetchImpl) => ({ fetchImpl, sleep: vi.fn(async () => {}) });

describe("read-only HTTP smoke", () => {
  it("retries transient failures at most three times", async () => {
    const fetchImpl = vi.fn(async () => response(503));
    await expect(request("https://example.com", "Site", options(fetchImpl))).rejects.toThrow("503 (attempt 3/3)");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
  it("can recover after a transient failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(response(502)).mockResolvedValueOnce(response(200, "ok"));
    expect((await request("https://example.com", "Site", options(fetchImpl))).body).toBe("ok");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
  it.each([401, 403, 404])("fails immediately for HTTP %s", async (status) => {
    const fetchImpl = vi.fn().mockResolvedValue(response(status));
    await expect(request("https://example.com", "Auth health", options(fetchImpl))).rejects.toThrow(`received ${status}`);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
  it("aborts timed out requests and never logs sensitive transport messages", async () => {
    const fetchImpl = vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new Error("secret-url-and-key")), { once: true });
    }));
    await expect(request("https://example.com", "Site", { ...options(fetchImpl), timeoutMs: 1 })).rejects.toThrow("network failure or timeout after 3 attempts");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
  it("requires health configuration and forbids elevated keys before fetching", async () => {
    const fetchImpl = vi.fn();
    await expect(checkSupabase(undefined, undefined, options(fetchImpl))).rejects.toThrow("SUPABASE_URL is required");
    await expect(checkSupabase("https://example.com", "", options(fetchImpl))).rejects.toThrow("secret is required");
    await expect(checkSupabase("https://example.com", "sb_secret_example", options(fetchImpl))).rejects.toThrow("elevated keys are forbidden");
    const elevatedJWT = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.example`;
    await expect(checkSupabase("https://example.com", elevatedJWT, options(fetchImpl))).rejects.toThrow("only an anon or publishable key");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("requires real health JSON, sends apikey, and disallows redirects", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(200, JSON.stringify({ name: "GoTrue", version: "v2.test" })));
    await checkSupabase("https://example.com", "sb_publishable_example", options(fetchImpl));
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url.pathname).toBe("/auth/v1/health");
    expect(init.headers).toEqual({ apikey: "sb_publishable_example" });
    expect(init.redirect).toBe("error");
    fetchImpl.mockResolvedValue(response(200, html, "text/html"));
    await expect(checkSupabase("https://example.com", "sb_publishable_example", options(fetchImpl))).rejects.toThrow("expected JSON");
    fetchImpl.mockResolvedValue(response(200, '{}'));
    await expect(checkSupabase("https://example.com", "sb_publishable_example", options(fetchImpl))).rejects.toThrow("unexpected health response");
  });
  it("checks routes and assets without issuing mutation requests", async () => {
    const fetchImpl = vi.fn(async (url) => url.pathname.endsWith(".js") ? response(200, "console.log('app')", "text/javascript")
      : url.pathname.endsWith(".css") ? response(200, "body{}", "text/css")
      : url.pathname.endsWith(".png") ? response(200, "image", "image/png") : response(200, html, "text/html"));
    await checkSite("https://example.com", options(fetchImpl));
    expect(fetchImpl.mock.calls.map(([url]) => url.pathname)).toContain("/laporan");
    for (const [, init] of fetchImpl.mock.calls) expect(init.method).toBeUndefined();
  });
  it("rejects SPA fallback for assets and credential-bearing URLs", async () => {
    const fetchImpl = vi.fn(async () => response(200, html, "text/html"));
    await expect(checkSite("https://example.com", options(fetchImpl))).rejects.toThrow("wrong content type");
    await expect(checkSite("https://user:password@example.com", options(fetchImpl))).rejects.toThrow("without credentials");
    await expect(checkSite("http://example.com", options(fetchImpl))).rejects.toThrow("HTTPS origin");
  });
  it("recognizes only Vercel's optional toolbar while still requiring local app assets", async () => {
    const toolbar = '<script src="https://vercel.live/_next-live/feedback/feedback.js"></script>';
    const fetchImpl = vi.fn(async (url) => url.pathname.endsWith(".js") ? response(200, "app", "text/javascript")
      : url.pathname.endsWith(".css") ? response(200, "body{}", "text/css")
      : url.pathname.endsWith(".png") ? response(200, "image", "image/png") : response(200, html + toolbar, "text/html"));
    await checkSite("https://example.com", options(fetchImpl));
    expect(fetchImpl.mock.calls.every(([url]) => url.origin === "https://example.com")).toBe(true);
    fetchImpl.mockImplementation(async () => response(200, html + '<script src="https://other.example/app.js"></script>', "text/html"));
    await expect(checkSite("https://example.com", options(fetchImpl))).rejects.toThrow("unexpected external origin");
    fetchImpl.mockImplementation(async () => response(200, '<title>RapiKasir</title><div id="root"></div><link href="/app.css">' + toolbar, "text/html"));
    await expect(checkSite("https://example.com", options(fetchImpl))).rejects.toThrow("entry assets are required");
  });
});
