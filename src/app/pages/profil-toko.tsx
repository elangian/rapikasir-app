import { useState } from "react";
import { Store, User, Mail, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useTier, TIER_LABEL } from "../context/tier-context";
import { STORE_CATEGORIES } from "../data/mock-data";

export function ProfilToko() {
  const { user, store, completeOnboarding } = useAuth();
  const { tier } = useTier();

  const [storeName, setStoreName] = useState(store?.name || "");
  const [ownerName, setOwnerName] = useState(store?.ownerName || "");
  const [category, setCategory] = useState(store?.category || "lainnya");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaved(false);
    setSaving(true);
    try {
      const categoryLabel = STORE_CATEGORIES.find((c) => c.key === category)?.label || "Lainnya";
      await completeOnboarding({
        name: storeName.trim() || "Tokomu",
        ownerName: ownerName.trim() || "Pemilik Toko",
        category,
        categoryLabel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display">Profil Toko</h1>
        <p className="text-muted-foreground">Kelola data tokomu yang tampil di seluruh aplikasi.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-md border-2 border-border bg-card p-6 shadow-brutal-sm">
        {errorMsg && (
          <div className="flex items-start gap-2 rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {errorMsg}
          </div>
        )}
        {saved && (
          <div className="flex items-start gap-2 rounded-md border-2 border-success/40 bg-block-green px-3 py-2.5 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            Perubahan tersimpan.
          </div>
        )}

        <div>
          <label htmlFor="store-name" className="mb-1.5 block text-sm font-medium">Nama Toko</label>
          <div className="relative">
            <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="store-name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              className="h-11 w-full rounded-md border-2 border-border bg-card pl-10 pr-3 text-base"
            />
          </div>
        </div>

        <div>
          <label htmlFor="owner-name" className="mb-1.5 block text-sm font-medium">Nama Pemilik</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="owner-name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              className="h-11 w-full rounded-md border-2 border-border bg-card pl-10 pr-3 text-base"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              value={user?.email || ""}
              disabled
              className="h-11 w-full rounded-md border-2 border-border bg-muted pl-10 pr-3 text-base text-muted-foreground"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Email login tidak bisa diganti di sini.</p>
        </div>

        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium">Kategori Usaha</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-md border-2 border-border bg-card px-3 text-base"
          >
            {STORE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-border pt-5">
          <div>
            <p className="text-sm font-medium">Paket Aktif</p>
            <span className="mt-1 inline-block rounded-md border-2 border-border bg-block-amber px-2 py-0.5 text-xs font-bold">
              {TIER_LABEL[tier]}
            </span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="press-scale flex items-center gap-2 rounded-md border-2 border-border bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-brutal-sm disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menyimpan…
              </>
            ) : (
              <>
                <Save className="size-4" /> Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
