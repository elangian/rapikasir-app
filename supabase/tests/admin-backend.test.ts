import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ADMIN = "11111111-1111-4111-8111-111111111111";
const OWNER = "22222222-2222-4222-8222-222222222222";
const migration = readFileSync("supabase/migration-4-admin-backend.sql", "utf8");
let db: PGlite;
async function asRole<T>(role: "service_role" | "authenticated" | "anon", query: string) {
  await db.exec(`set role ${role};`);
  try { return await db.query<T>(query); }
  finally { await db.exec("reset role;"); }
}
const setTier = (actor = ADMIN, tier = "PRO") => `select public.admin_set_store_tier('${actor}','${OWNER}','${tier}','Approved manual assignment') as result`;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    insert into auth.users values ('${ADMIN}'),('${OWNER}');
  `);
  await db.exec(readFileSync("supabase/schema.sql", "utf8"));
  await db.exec(readFileSync("supabase/migration-3-tenant-security.sql", "utf8"));
  await db.exec(`insert into stores(id,store_name,owner_name) values('${OWNER}','Owner store','Owner');`);
  await db.exec(migration);
}, 30_000);
afterAll(async () => { await db?.close(); });

describe("admin RPCs (local PostgreSQL)", { concurrent: false }, () => {
  it("is repeatable and provisions no administrator", async () => {
    await db.exec(migration);
    expect((await db.query("select * from rapikasir_private.admin_memberships")).rows).toEqual([]);
    await expect(asRole("service_role", setTier())).rejects.toThrow(/Admin access denied/);
  });
  it.each(["anon", "authenticated"] as const)("denies membership/audit access and all admin RPCs to %s", async (role) => {
    for (const table of ["admin_memberships", "admin_audit_log"]) {
      await expect(asRole(role, `select * from rapikasir_private.${table}`)).rejects.toThrow(/permission denied/);
      await expect(asRole(role, `insert into rapikasir_private.${table} default values`)).rejects.toThrow(/permission denied/);
    }
    await expect(asRole(role, setTier())).rejects.toThrow(/permission denied/);
    await expect(asRole(role, `select * from public.admin_list_stores('${ADMIN}')`)).rejects.toThrow(/permission denied/);
  });
  it("rechecks role, permits verified-server assignments, and records previous/new tier atomically", async () => {
    await db.exec(`insert into rapikasir_private.admin_memberships(user_id) values('${ADMIN}');`);
    await expect(asRole("service_role", setTier(OWNER))).rejects.toThrow(/Admin access denied/);
    const result = await asRole<{ result: { tier: string; storeId: string; auditId: string } }>("service_role", setTier());
    expect(result.rows[0].result).toMatchObject({ tier: "PRO", storeId: OWNER });
    expect((await db.query("select actor_id,store_id,previous_tier,next_tier from rapikasir_private.admin_audit_log")).rows).toEqual([{ actor_id: ADMIN, store_id: OWNER, previous_tier: "FREE", next_tier: "PRO" }]);
    expect((await asRole("service_role", `select tier from public.admin_list_stores('${ADMIN}')`)).rows).toEqual([{ tier: "PRO" }]);
    await db.exec(`update rapikasir_private.admin_memberships set enabled=false where user_id='${ADMIN}';`);
    await expect(asRole("service_role", setTier())).rejects.toThrow(/Admin access denied/);
    await expect(asRole("service_role", `select * from public.admin_list_stores('${ADMIN}')`)).rejects.toThrow(/Admin access denied/);
    await db.exec(`update rapikasir_private.admin_memberships set enabled=true where user_id='${ADMIN}';`);
  });
  it("enforces SQL validation even if HTTP validation is bypassed", async () => {
    await expect(asRole("service_role", setTier(ADMIN, "UNKNOWN"))).rejects.toThrow(/Invalid tier/);
    await expect(asRole("service_role", `select public.admin_set_store_tier('${ADMIN}','${OWNER}','PRO','short')`)).rejects.toThrow(/Invalid tier or reason/);
    await expect(asRole("service_role", `select * from public.admin_list_stores('${ADMIN}',0,1000)`)).rejects.toThrow(/Invalid pagination/);
    expect((await db.query("select tier from stores")).rows).toEqual([{ tier: "PRO" }]);
    expect((await db.query("select count(*)::int as count from rapikasir_private.admin_audit_log")).rows).toEqual([{ count: 1 }]);
  });
  it("rolls back the tier update if audit insertion fails", async () => {
    await db.exec(`create function rapikasir_private.reject_audit() returns trigger language plpgsql as $$ begin raise exception 'audit unavailable'; end; $$;
      create trigger reject_audit before insert on rapikasir_private.admin_audit_log for each row execute function rapikasir_private.reject_audit();`);
    await expect(asRole("service_role", setTier(ADMIN, "BUSINESS"))).rejects.toThrow(/audit unavailable/);
    expect((await db.query("select tier from stores")).rows).toEqual([{ tier: "PRO" }]);
    await db.exec("drop trigger reject_audit on rapikasir_private.admin_audit_log; drop function rapikasir_private.reject_audit();");
  });
  it("enforces a durable per-actor mutation rate limit", async () => {
    await db.exec(`insert into rapikasir_private.admin_audit_log(actor_id,store_id,action,previous_tier,next_tier,reason)
      select '${ADMIN}','${OWNER}','set_store_tier','PRO','PRO','Rate limit fixture' from generate_series(1,30);`);
    await expect(asRole("service_role", setTier(ADMIN, "BUSINESS"))).rejects.toThrow(/rate limit reached/);
    expect((await db.query("select tier from stores")).rows).toEqual([{ tier: "PRO" }]);
  });
});
