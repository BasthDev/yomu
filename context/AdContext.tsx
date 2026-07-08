import Constants from "expo-constants";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { useRewardedAd } from "../hooks/useRewardedAd";

type ShowAdResult = { earned: boolean };

interface AdContextValue {
  isRewardedLoaded: boolean;
  isRewardedLoading: boolean;
  showRewardedAd: () => Promise<ShowAdResult>;
  loadRewardedAd: () => void;
}

const AdContext = createContext<AdContextValue | null>(null);

// Only disable ads when actually running in Expo Go (not in prebuilt debug builds)
const isExpoGo = Constants.appOwnership === "expo";

export function AdProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isLoading, showAd, loadAd } = useRewardedAd();

  const adValue = useMemo<AdContextValue>(() => ({
    isRewardedLoaded: isLoaded,
    isRewardedLoading: isLoading,
    showRewardedAd: showAd,
    loadRewardedAd: loadAd,
  }), [isLoaded, isLoading, showAd, loadAd]);

  return <AdContext.Provider value={adValue}>{children}</AdContext.Provider>;
}

export function useGlobalRewardedAd() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error("useGlobalRewardedAd must be used within AdProvider");
  }
  return context;
}
