import { pathToFileURL } from "node:url";

const RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

// Never include response bodies, request URLs, keys, or transport errors in logs.
export async function request(url, label, {
  headers = {}, fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  timeoutMs = 10_000,
} = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let result;
    try {
      const response = await fetchImpl(url, {
        headers, signal: controller.signal, redirect: "error",
      });
      result = {
        status: response.status,
        contentType: response.headers.get("content-type") ?? "",
        body: await response.text(),
      };
    } catch {
      if (attempt === 3) throw new Error(`${label}: network failure or timeout after 3 attempts`);
    } finally {
      clearTimeout(timer);
    }
    if (result?.status === 200) return result;
    if (result && (!RETRY_STATUSES.has(result.status) || attempt === 3)) {
      throw new Error(`${label}: expected HTTP 200, received ${result.status} (attempt ${attempt}/3)`);
    }
    await sleep(500 * attempt);
  }
  throw new Error(`${label}: retry limit reached`);
}

function httpsURL(value, name) {
  if (!value) throw new Error(`${name} is required`);
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be a valid HTTPS origin`); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error(`${name} must be an HTTPS origin without credentials, query, or path`);
  }
  return url;
}

export async function checkSite(value, options) {
  const base = httpsURL(value, "SITE_URL");
  const page = await request(base, "Site root", options);
  assertHTML(page, "Site root");
  const assets = [];
  for (const match of page.body.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)) {
    const url = new URL(match[1], base);
    if (url.username || url.password) throw new Error("Site asset: credentials are forbidden");
    // Vercel injects its optional Preview toolbar independently of app assets.
    if (url.origin === "https://vercel.live" && url.pathname === "/_next-live/feedback/feedback.js") continue;
    if (url.origin !== base.origin) throw new Error("Site asset: unexpected external origin");
    assets.push(url.href);
  }
  if (!assets.some((a) => /\.js(?:\?|$)/.test(a)) || !assets.some((a) => /\.css(?:\?|$)/.test(a))) {
    throw new Error("Site root: JavaScript and CSS entry assets are required");
  }
  for (const path of new Set([...assets, "/logo-icon.png"])) {
    const url = new URL(path, base);
    if (url.origin !== base.origin) throw new Error("Site asset: unexpected external origin");
    const result = await request(url, "Site asset", options);
    const mime = /\.css$/.test(url.pathname) ? /text\/css/i
      : /\.js$/.test(url.pathname) ? /(?:javascript|ecmascript)/i : /image\/png/i;
    if (!mime.test(result.contentType) || !result.body.length || /<html/i.test(result.body)) {
      throw new Error("Site asset: wrong content type, empty body, or SPA fallback");
    }
  }
  for (const path of ["/login", "/register", "/produk", "/transaksi", "/laporan", "/admin/users", "/pembayaran"]) {
    assertHTML(await request(new URL(path, base), `Route ${path}`, options), `Route ${path}`);
  }
}

function assertHTML(page, label) {
  if (!/text\/html/i.test(page.contentType) || !/id=["']root["']/.test(page.body) || !/RapiKasir/.test(page.body)) {
    throw new Error(`${label}: expected RapiKasir HTML and React root`);
  }
}

export async function checkSupabase(value, key, options = {}) {
  const base = httpsURL(value, "SUPABASE_URL");
  if (!key) throw new Error("SUPABASE_PUBLISHABLE_KEY secret is required (publishable/anon key only)");
  // Reject service-role and secret keys: this health check needs no elevated access.
  if (key.startsWith("sb_secret_")) throw new Error("Supabase health: elevated keys are forbidden");
  if (key.startsWith("eyJ")) {
    let claims;
    try { claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()); }
    catch { throw new Error("Supabase health: invalid anon key format"); }
    if (claims.role !== "anon") throw new Error("Supabase health: only an anon or publishable key is allowed");
  } else if (!key.startsWith("sb_publishable_")) {
    throw new Error("Supabase health: only an anon or publishable key is allowed");
  }
  const result = await request(new URL("/auth/v1/health", base), "Supabase Auth health", {
    ...options, headers: { apikey: key },
  });
  let health;
  try { health = JSON.parse(result.body); }
  catch { throw new Error("Supabase Auth health: expected JSON response"); }
  if (!/application\/json/i.test(result.contentType) || health.name !== "GoTrue" || typeof health.version !== "string" || !health.version) {
    throw new Error("Supabase Auth health: unexpected health response");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const mode = process.argv[2];
    if (mode === "site") await checkSite(process.env.SITE_URL);
    else if (mode === "supabase") await checkSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
    else throw new Error("Usage: node scripts/smoke.mjs site|supabase");
    console.log(`${mode}: read-only smoke check passed`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
