import { createContext, useContext, useState, type ReactNode } from "react";

export type Tier = "FREE" | "TRIAL" | "PRO" | "BUSINESS";

/** Gated capabilities across the app. */
export type Feature =
  | "reports"
  | "grossProfit"
  | "netProfit"
  | "export"
  | "multiUser"
  | "multiBranch"
  | "discount"
  | "qris";

/** Which tier is the minimum required to unlock each feature. */
const FEATURE_MIN_TIER: Record<Feature, Tier> = {
  reports: "TRIAL",
  grossProfit: "TRIAL",
  netProfit: "PRO",
  export: "TRIAL",
  discount: "PRO",
  qris: "BUSINESS",
  multiUser: "PRO",
  multiBranch: "BUSINESS",
};

const TIER_RANK: Record<Tier, number> = {
  FREE: 0,
  TRIAL: 1,
  PRO: 2,
  BUSINESS: 3,
};

/** Max products allowed per tier (Infinity = unlimited). */
export const TIER_PRODUCT_LIMIT: Record<Tier, number> = {
  FREE: 30,
  TRIAL: 300,
  PRO: 500,
  BUSINESS: Infinity,
};

export const TIER_LABEL: Record<Tier, string> = {
  FREE: "FREE",
  TRIAL: "TRIAL PRO",
  PRO: "PRO",
  BUSINESS: "BUSINESS",
};

interface TierContextValue {
  tier: Tier;
  setTier: (tier: Tier) => void;
  canUse: (feature: Feature) => boolean;
  /** The label of the minimum tier that unlocks a feature, e.g. "PRO". */
  requiredTierLabel: (feature: Feature) => string;
  productLimit: number;
}

const TierContext = createContext<TierContextValue | null>(null);

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>("FREE");

  const value: TierContextValue = {
    tier,
    setTier,
    canUse: (feature) => TIER_RANK[tier] >= TIER_RANK[FEATURE_MIN_TIER[feature]],
    requiredTierLabel: (feature) => TIER_LABEL[FEATURE_MIN_TIER[feature]],
    productLimit: TIER_PRODUCT_LIMIT[tier],
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier(): TierContextValue {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error("useTier must be used within a TierProvider");
  return ctx;
}
