import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
const migration = readFileSync("supabase/migration-3-tenant-security.sql", "utf8");
let db: PGlite;

// Emulate Supabase's verified request identity in an ephemeral local Postgres.
// No environment variables, credentials, or network/database connection used.
async function asUser<T>(id: string | null, query: string) {
  await db.exec(`set role ${id ? "authenticated" : "anon"};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? ""]);
  try { return await db.query<T>(query); }
  finally { await db.exec("reset role;"); }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}'), ('${C}');
  `);
  await db.exec(readFileSync("supabase/schema.sql", "utf8"));
  await db.exec(readFileSync("supabase/migration-2-transaction-items.sql", "utf8"));
  // Reproduce the historical dangerous grants/policy plus unknown broad policies.
  await db.exec(`
    create policy "admin authenticated full access" on stores for all to authenticated using (true) with check (true);
    grant all on stores, products, transactions to anon, authenticated;
    grant update(tier) on stores to authenticated;
    create policy "legacy broad stores" on stores for all to authenticated using (true) with check (true);
    create policy "legacy broad products" on products for all to authenticated using (true) with check (true);
    create policy "legacy broad transactions" on transactions for all to authenticated using (true) with check (true);
    insert into stores (id,store_name,owner_name,tier) values ('${A}','A','A','FREE'),('${B}','B','B','PRO');
    insert into products (store_id,name,price) values ('${A}','A product',10000),('${B}','B product',20000);
    insert into transactions (store_id,item,total,method) values ('${A}','A sale',10000,'Cash'),('${B}','B sale',20000,'Transfer');
  `);
  await db.exec(migration);
}, 30_000);
afterAll(async () => { await db?.close(); });

describe("tenant security migration (real local PostgreSQL)", { concurrent: false }, () => {
  it("is repeatable and removes the historical admin policy", async () => {
    await db.exec(migration);
    expect((await db.query("select 1 from pg_policies where policyname = 'admin authenticated full access'")).rows).toEqual([]);
  });

  it.each(["stores", "products", "transactions"])("denies anonymous reads and writes to %s", async (table) => {
    await expect(asUser(null, `select * from ${table}`)).rejects.toThrow(/permission denied/);
    await expect(asUser(null, `delete from ${table}`)).rejects.toThrow(/permission denied/);
  });

  it.each(["stores", "products", "transactions"])("isolates both owners in %s despite broad legacy policies", async (table) => {
    const col = table === "stores" ? "id" : "store_id";
    expect((await asUser(A, `select ${col} from ${table}`)).rows).toEqual([{ [col]: A }]);
    expect((await asUser(B, `select ${col} from ${table}`)).rows).toEqual([{ [col]: B }]);
  });

  it("permits onboarding profile edits but denies store identity and tier changes", async () => {
    expect((await asUser(A, `update stores set store_name='Updated', owner_name='Owner', category='retail', category_label='Retail', onboarded=true where id='${A}' returning store_name`)).rows).toEqual([{ store_name: "Updated" }]);
    for (const change of ["tier='PRO'", "tier='TRIAL'", "tier='BUSINESS'", `id='${C}'`]) {
      await expect(asUser(A, `update stores set ${change} where id='${A}'`)).rejects.toThrow(/permission denied/);
    }
    expect((await asUser(A, `update stores set store_name='hijack' where id='${B}' returning id`)).rows).toEqual([]);
  });

  it("rejects paid/trial creation, cross-owner creation, tier upsert and store deletion", async () => {
    for (const tier of ["PRO", "BUSINESS", "TRIAL"]) {
      await expect(asUser(C, `insert into stores (id,store_name,owner_name,tier) values ('${C}','C','C','${tier}')`)).rejects.toThrow(/row-level security/);
    }
    await expect(asUser(C, `insert into stores (id,store_name,owner_name) values ('${A}','bad','bad')`)).rejects.toThrow(/row-level security/);
    await expect(asUser(A, `insert into stores (id,store_name,owner_name,tier) values ('${A}','A','A','PRO') on conflict(id) do update set tier=excluded.tier`)).rejects.toThrow(/permission denied|row-level security/);
    await expect(asUser(A, `delete from stores where id='${A}'`)).rejects.toThrow(/permission denied/);
    expect((await asUser(C, `insert into stores (id,store_name,owner_name) values ('${C}','C','C') returning tier`)).rows).toEqual([{ tier: "FREE" }]);
    expect((await asUser(B, "select tier from stores")).rows).toEqual([{ tier: "PRO" }]);
  });

  it.each(["products", "transactions"])("allows owner CRUD but blocks tenant transfer and cross-tenant writes in %s", async (table) => {
    // INSERT uses the caller's verified tenant, not a UI filter.
    const columns = table === "products" ? "name,price" : "item,total,method";
    const values = table === "products" ? "'LOCAL',5000" : "'LOCAL',5000,'Cash'";
    await expect(asUser(A, `insert into ${table} (store_id,${columns}) values ('${B}',${values})`)).rejects.toThrow(/row-level security/);
    const created = await asUser<{ id: string }>(A, `insert into ${table} (store_id,${columns}) values ('${A}',${values}) returning id`);
    const id = created.rows[0].id;
    await expect(asUser(A, `update ${table} set store_id='${B}' where id='${id}'`)).rejects.toThrow(/row-level security/);
    const change = table === "products" ? "stock=7" : "total=7000";
    expect((await asUser(A, `update ${table} set ${change} where store_id='${B}' returning id`)).rows).toEqual([]);
    expect((await asUser(A, `delete from ${table} where store_id='${B}' returning id`)).rows).toEqual([]);
    expect((await asUser(A, `update ${table} set ${change} where id='${id}' returning id`)).rows).toEqual([{ id }]);
    expect((await asUser(A, `delete from ${table} where id='${id}' returning id`)).rows).toEqual([{ id }]);
  });
});
