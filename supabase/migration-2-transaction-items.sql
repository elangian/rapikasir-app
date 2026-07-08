-- RapiKasir — kolom rincian item per transaksi (lanjutan Fase 6)
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query
--
-- Aman dijalankan di database yang sudah punya tabel `transactions` dari
-- schema.sql: kolom baru default '[]' jadi baris lama (kalau ada) tetap valid,
-- dan tidak mengubah policy RLS yang sudah ada ("own transactions" tetap
-- berlaku untuk kolom ini juga karena scope-nya per-baris, bukan per-kolom).

alter table transactions
  add column if not exists items jsonb not null default '[]'::jsonb;

comment on column transactions.items is
  'Rincian per-produk saat checkout: array of {product_id, name, qty, price, cost}. Dipakai halaman Laporan untuk menghitung produk terlaris dan laba kotor per periode.';
