-- RapiKasir — skema dasar (Fase 6 tutorial Supabase)
-- Bootstrap only: apply migration 2 and migration 3 before exposing the API.
-- Existing databases must use migrations, not rerun this schema.

create table stores (
  id uuid primary key references auth.users(id) on delete cascade,
  store_name text not null,
  owner_name text not null,
  category text,
  category_label text,
  tier text not null default 'FREE' check (tier in ('FREE','TRIAL','PRO','BUSINESS')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  category text,
  price numeric not null,
  cost numeric not null default 0,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  item text not null,
  items_count integer not null default 1,
  total numeric not null,
  method text not null check (method in ('Cash','Transfer','QRIS')),
  created_at timestamptz not null default now()
);

alter table stores enable row level security;
alter table products enable row level security;
alter table transactions enable row level security;

-- Default: tiap toko cuma bisa baca/tulis datanya sendiri.
create policy "own store" on stores for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "own products" on products for all to authenticated
  using (auth.uid() = store_id) with check (auth.uid() = store_id);
create policy "own transactions" on transactions for all to authenticated
  using (auth.uid() = store_id) with check (auth.uid() = store_id);
