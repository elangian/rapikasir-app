-- Review and test in an isolated database first. Do not run automatically.
-- Requires schema.sql; compatible with migration 2 (items is unaffected).
-- Apply BEFORE deploying the frontend change to production.
begin;

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "admin authenticated full access" on public.stores;
drop policy if exists "own store" on public.stores;
drop policy if exists "own products" on public.products;
drop policy if exists "own transactions" on public.transactions;

create policy "own store" on public.stores for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own products" on public.products for all to authenticated
  using ((select auth.uid()) = store_id) with check ((select auth.uid()) = store_id);
create policy "own transactions" on public.transactions for all to authenticated
  using ((select auth.uid()) = store_id) with check ((select auth.uid()) = store_id);

-- Restrictive guards intersect with EVERY permissive policy, including any
-- previously installed policy that is not part of this repository.
drop policy if exists "tenant guard stores" on public.stores;
drop policy if exists "tenant guard products" on public.products;
drop policy if exists "tenant guard transactions" on public.transactions;
drop policy if exists "free store creation" on public.stores;
create policy "tenant guard stores" on public.stores as restrictive for all to public
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "tenant guard products" on public.products as restrictive for all to public
  using ((select auth.uid()) = store_id) with check ((select auth.uid()) = store_id);
create policy "tenant guard transactions" on public.transactions as restrictive for all to public
  using ((select auth.uid()) = store_id) with check ((select auth.uid()) = store_id);
create policy "free store creation" on public.stores as restrictive for insert to public
  with check (tier = 'FREE');

-- RLS is row-level: ownership alone does not protect the tier column.
-- Remove table AND existing column grants, then allow only profile fields.
revoke all on public.stores, public.products, public.transactions from public, anon, authenticated;
revoke all (id, store_name, owner_name, category, category_label, tier, onboarded, created_at)
  on public.stores from public, anon, authenticated;
grant select, insert on public.stores to authenticated;
grant update (store_name, owner_name, category, category_label, onboarded)
  on public.stores to authenticated;
-- Store deletion is not a consumer feature; do not permit cascade deletion
-- or delete/reinsert as a way to alter subscription state.
grant select, insert, update, delete on public.products, public.transactions to authenticated;

commit;
