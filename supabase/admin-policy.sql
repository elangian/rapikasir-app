-- RapiKasir — akses admin untuk halaman /admin/users (Fase 6)
--
-- PERINGATAN: policy ini membuka tabel `stores` supaya SIAPA SAJA yang
-- login (authenticated role, bukan cuma pemilik row) bisa SELECT + DELETE
-- SEMUA baris. Ini digabung (OR) dengan policy "own store" yang sudah ada
-- di schema.sql, jadi tidak menggantikannya.
--
-- HANYA aman selama aplikasi masih tahap dev/testing dengan akun-akun
-- kamu sendiri. SEBELUM ada pengguna asli dari luar mendaftar di app ini,
-- policy ini WAJIB di-drop dan diganti sistem role admin yang benar
-- (mis. kolom is_admin + policy yang mengecek kolom itu, atau Edge
-- Function dengan service_role key di sisi server).
--
-- Cara mencabutnya nanti:
--   drop policy "admin authenticated full access" on stores;

create policy "admin authenticated full access" on stores
  for all
  to authenticated
  using (true)
  with check (true);
