export interface BackendResult { data: unknown; error: { code?: string } | null }
export interface AdminDependencies {
  // Must verify token with Supabase Auth, not just decode untrusted JWT claims.
  verifyUser: (token: string) => Promise<string | null>;
  listStores: (actorId: string, offset: number, limit: number) => Promise<BackendResult>;
  setTier: (actorId: string, storeId: string, tier: string, reason: string) => Promise<BackendResult>;
  allowedOrigins: readonly string[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIERS = new Set(["FREE", "TRIAL", "PRO", "BUSINESS"]);

export function createAdminHandler(deps: AdminDependencies) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get("origin");
    const headers: Record<string, string> = { "content-type": "application/json", "cache-control": "no-store", "vary": "Origin", "x-content-type-options": "nosniff" };
    const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !deps.allowedOrigins.includes(origin)) return respond(403, { error: "Origin denied" });
    if (origin) headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "GET, PATCH, OPTIONS";
    headers["access-control-allow-headers"] = "authorization, apikey, content-type, x-client-info";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (!["GET", "PATCH"].includes(req.method)) return respond(405, { error: "Method not allowed" });
    const bearer = /^Bearer ([^\s]{1,8192})$/i.exec(req.headers.get("authorization") ?? "");
    if (!bearer) return respond(401, { error: "Authentication required" });
    try {
      const actorId = await deps.verifyUser(bearer[1]);
      if (!actorId || !UUID.test(actorId)) return respond(401, { error: "Invalid session" });
      let result: BackendResult;
      if (req.method === "GET") {
        const url = new URL(req.url);
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const limit = Number(url.searchParams.get("limit") ?? 50);
        if ([...url.searchParams.keys()].some((key) => !["offset", "limit"].includes(key)) || !Number.isInteger(offset) || offset < 0 || offset > 10000 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
          return respond(400, { error: "Invalid pagination" });
        }
        result = await deps.listStores(actorId, offset, limit);
      } else {
        if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return respond(415, { error: "JSON required" });
        const reader = req.body?.getReader();
        if (!reader) return respond(400, { error: "JSON required" });
        const chunks: Uint8Array[] = []; let size = 0;
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          size += part.value.byteLength;
          if (size > 4096) { await reader.cancel(); return respond(413, { error: "Payload too large" }); }
          chunks.push(part.value);
        }
        const bytes = new Uint8Array(size); let position = 0;
        for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.byteLength; }
        let input: Record<string, unknown>;
        try { input = JSON.parse(new TextDecoder().decode(bytes)); }
        catch { return respond(400, { error: "Invalid JSON" }); }
        if (!input || Array.isArray(input) || typeof input !== "object" || Object.keys(input).some((key) => !["storeId", "tier", "reason"].includes(key)) || typeof input.storeId !== "string" || !UUID.test(input.storeId) || typeof input.tier !== "string" || !TIERS.has(input.tier) || typeof input.reason !== "string" || input.reason.trim().length < 8 || input.reason.trim().length > 500) {
          return respond(400, { error: "Invalid store, tier, or reason" });
        }
        result = await deps.setTier(actorId, input.storeId, input.tier, input.reason.trim());
      }
      if (result.error) {
        const status = ({ "42501": 403, "22023": 400, "P0002": 404, "P4290": 429 } as Record<string, number>)[result.error.code ?? ""] ?? 503;
        return respond(status, { error: status === 503 ? "Backend unavailable" : "Request denied" });
      }
      return respond(200, result.data);
    } catch {
      // Never log JWTs, keys, raw backend errors, profile data, or request bodies.
      return respond(503, { error: "Backend unavailable" });
    }
  };
}
