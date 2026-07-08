import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ShowAdResult = { earned: boolean };

interface AdContextValue {
  isRewardedLoaded: boolean;
  isRewardedLoading: boolean;
  showRewardedAd: () => Promise<ShowAdResult>;
  loadRewardedAd: () => void;
}

const AdContext = createContext<AdContextValue | null>(null);

// Check if running in Expo Go (where native modules aren't available)
const isExpoGo = __DEV__;

export function AdProvider({ children }: { children: ReactNode }) {
  const [adValue, setAdValue] = useState<AdContextValue>({
    isRewardedLoaded: false,
    isRewardedLoading: false,
    showRewardedAd: async () => ({ earned: false }),
    loadRewardedAd: () => {},
  });

  useEffect(() => {
    if (isExpoGo) {
      // Mock implementation for Expo Go
      return;
    }

    // Dynamic import to prevent loading in Expo Go
    import("../hooks/useRewardedAd")
      .then(({ useRewardedAd }) => {
        const { isLoaded, isLoading, showAd, loadAd } = useRewardedAd();
        setAdValue({
          isRewardedLoaded: isLoaded,
          isRewardedLoading: isLoading,
          showRewardedAd: showAd,
          loadRewardedAd: loadAd,
        });
      })
      .catch((err) => {
        console.error("Failed to load ads:", err);
      });
  }, []);

  return <AdContext.Provider value={adValue}>{children}</AdContext.Provider>;
}

export function useGlobalRewardedAd() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error("useGlobalRewardedAd must be used within AdProvider");
  }
  return context;
}
