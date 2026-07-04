import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set. Cek file .env.local (lokal) atau Environment Variables di Vercel (production).",
  );
}

export const supabase = createClient(url, key);