import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useTier, type Tier } from "./tier-context";
import { supabase } from "../lib/supabase";

export interface StoreProfile {
  name: string;
  ownerName: string;
  category: string;
  categoryLabel: string;
  productQty?: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

type AuthStatus = "guest" | "authed";

interface StoreRow {
  id: string;
  store_name: string;
  owner_name: string;
  category: string | null;
  category_label: string | null;
  tier: Tier;
  onboarded: boolean;
}

interface AuthContextValue {
  status: AuthStatus;
  onboarded: boolean;
  loading: boolean;
  user: AuthUser | null;
  store: StoreProfile | null;
  register: (input: { storeName: string; email: string; password: string; tier: Tier }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  completeOnboarding: (store: StoreProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchStoreRow(userId: string): Promise<StoreRow | null> {
  const { data, error } = await supabase.from("stores").select("*").eq("id", userId).maybeSingle();
  if (error) {
    console.error("Gagal ambil data toko:", error.message);
    return null;
  }
  return data as StoreRow | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setTier } = useTier();
  const [session, setSession] = useState<Session | null>(null);
  const [storeRow, setStoreRow] = useState<StoreRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const row = await fetchStoreRow(data.session.user.id);
        if (!mounted) return;
        setStoreRow(row);
        if (row) setTier(row.tier);
      }
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const row = await fetchStoreRow(newSession.user.id);
        setStoreRow(row);
        if (row) setTier(row.tier);
      } else {
        setStoreRow(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register: AuthContextValue["register"] = async ({ storeName, email, password, tier }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Registrasi gagal, coba lagi.");

    const { error: insertError } = await supabase.from("stores").insert({
      id: data.user.id,
      store_name: storeName,
      owner_name: storeName,
      tier,
      onboarded: false,
    });
    if (insertError) throw insertError;

    setTier(tier);
    setStoreRow({
      id: data.user.id,
      store_name: storeName,
      owner_name: storeName,
      category: null,
      category_label: null,
      tier,
      onboarded: false,
    });
  };

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const completeOnboarding: AuthContextValue["completeOnboarding"] = async (storeInput) => {
    if (!session?.user) throw new Error("Belum login.");

    const { error } = await supabase
      .from("stores")
      .update({
        store_name: storeInput.name,
        owner_name: storeInput.ownerName,
        category: storeInput.category,
        category_label: storeInput.categoryLabel,
        onboarded: true,
      })
      .eq("id", session.user.id);
    if (error) throw error;

    setStoreRow((prev) =>
      prev
        ? {
            ...prev,
            store_name: storeInput.name,
            owner_name: storeInput.ownerName,
            category: storeInput.category,
            category_label: storeInput.categoryLabel,
            onboarded: true,
          }
        : prev,
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const user: AuthUser | null = session?.user
    ? { id: session.user.id, name: storeRow?.owner_name || "Pemilik Toko", email: session.user.email ?? "" }
    : null;

  const store: StoreProfile | null = storeRow
    ? {
        name: storeRow.store_name,
        ownerName: storeRow.owner_name,
        category: storeRow.category || "lainnya",
        categoryLabel: storeRow.category_label || "Lainnya",
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        status: session ? "authed" : "guest",
        onboarded: storeRow?.onboarded ?? false,
        loading,
        user,
        store,
        register,
        login,
        completeOnboarding,
        logout,
      }}
    >
      {loading ? <AuthLoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-4 border-border border-t-accent" />
    </div>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}