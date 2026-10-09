import { createClient } from "npm:@supabase/supabase-js@2.110.0";
import { createAdminHandler } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL");
const publicKey = Deno.env.get("SUPABASE_ANON_KEY");
const serverKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const origins = (Deno.env.get("ADMIN_ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const validOrigins = origins.length > 0 && origins.every((origin) => {
  try { const parsed = new URL(origin); return parsed.protocol === "https:" && parsed.origin === origin && !parsed.username && !parsed.password; }
  catch { return false; }
});

if (!url || !publicKey || !serverKey || !validOrigins) {
  Deno.serve(() => new Response(JSON.stringify({ error: "Admin backend is not configured" }), {
    status: 503, headers: { "content-type": "application/json", "cache-control": "no-store" },
  }));
} else {
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) },
  };
  // The caller's token is never attached to the service-role client.
  const auth = createClient(url, publicKey, options);
  const server = createClient(url, serverKey, options);
  Deno.serve(createAdminHandler({
    allowedOrigins: origins,
    verifyUser: async (token) => {
      const { data, error } = await auth.auth.getUser(token);
      return error ? null : data.user?.id ?? null;
    },
    listStores: async (actorId, offset, limit) => await server.rpc("admin_list_stores", { p_actor_id: actorId, p_offset: offset, p_limit: limit }),
    setTier: async (actorId, storeId, tier, reason) => await server.rpc("admin_set_store_tier", { p_actor_id: actorId, p_store_id: storeId, p_tier: tier, p_reason: reason }),
  }));
}
