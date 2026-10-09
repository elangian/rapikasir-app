-- RETIRED: never grant all authenticated users administrative access.
-- This file only revokes the historical unsafe policy. Apply migration 3
-- for tenant isolation and tier protection. It does not provision admins.
drop policy if exists "admin authenticated full access" on public.stores;
