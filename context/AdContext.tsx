import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useRewardedAd } from "../hooks/useRewardedAd";

type ShowAdResult = { earned: boolean };

interface AdContextValue {
  isRewardedLoaded: boolean;
  isRewardedLoading: boolean;
  showRewardedAd: () => Promise<ShowAdResult>;
  loadRewardedAd: () => void;
}

const AdContext = createContext<AdContextValue | null>(null);

export function AdProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isLoading, showAd, loadAd } = useRewardedAd();

  const value = {
    isRewardedLoaded: isLoaded,
    isRewardedLoading: isLoading,
    showRewardedAd: showAd,
    loadRewardedAd: loadAd,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useGlobalRewardedAd() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error("useGlobalRewardedAd must be used within AdProvider");
  }
  return context;
}
