import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTier, type Tier } from "./tier-context";

const STORAGE_KEY = "rapikasir.auth";

export interface StoreProfile {
  name: string;
  ownerName: string;
  category: string;
  categoryLabel: string;
  phone?: string;
  productQty?: string;
}

interface AuthUser {
  name: string;
  email: string;
}

type AuthStatus = "guest" | "authed";

interface StoredAuth {
  status: AuthStatus;
  onboarded: boolean;
  user: AuthUser | null;
  store: StoreProfile | null;
}

interface AuthContextValue extends StoredAuth {
  register: (input: { storeName: string; email: string; password: string; tier: Tier }) => void;
  login: (input: { email: string; password: string }) => void;
  completeOnboarding: (store: StoreProfile) => void;
  logout: () => void;
}

const DEFAULT_STATE: StoredAuth = {
  status: "guest",
  onboarded: false,
  user: null,
  store: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStored(): StoredAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setTier } = useTier();
  const [state, setState] = useState<StoredAuth>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Init from localStorage on mount (client-only).
  useEffect(() => {
    setState(loadStored());
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change, after initial hydration.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const register: AuthContextValue["register"] = ({ storeName, email, tier }) => {
    setTier(tier);
    setState({
      status: "authed",
      onboarded: false,
      user: { name: storeName || "Pemilik Toko", email },
      store: null,
    });
  };

  const login: AuthContextValue["login"] = ({ email }) => {
    // Demo mode: any email/password combination is accepted.
    setState((prev) => ({
      status: "authed",
      onboarded: true,
      user: prev.user ?? { name: "Pemilik Toko", email },
      store: prev.store ?? {
        name: "Toko Demo",
        ownerName: "Pemilik Toko",
        category: "lainnya",
        categoryLabel: "Lainnya",
      },
    }));
  };

  const completeOnboarding: AuthContextValue["completeOnboarding"] = (store) => {
    setState((prev) => ({ ...prev, onboarded: true, store }));
  };

  const logout = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, completeOnboarding, logout }}>
      {hydrated ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
