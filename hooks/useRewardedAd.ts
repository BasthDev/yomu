import { useEffect, useRef, useState } from "react";
import { AD_UNIT_IDS } from "../utils/adConfig";

type ShowAdResult = { earned: boolean };

type UseRewardedAdOptions = {
  onRewardEarned?: () => void | Promise<void>;
};

// Check if running in Expo Go (where native modules aren't available)
const isExpoGo = __DEV__;

export const useRewardedAd = (options?: UseRewardedAdOptions) => {
  // Return mock implementation in Expo Go
  if (isExpoGo) {
    return {
      isLoaded: false,
      isLoading: false,
      isEarned: false,
      error: null,
      showAd: async () => ({ earned: false }),
      loadAd: () => {},
    };
  }

  // Dynamic import to prevent loading in Expo Go
  const [rewardedAd, setRewardedAd] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRewardEarnedRef = useRef(options?.onRewardEarned);
  const userInitiatedShowRef = useRef(false);
  const earnedThisShowRef = useRef(false);
  const showAdPromiseRef = useRef<((result: ShowAdResult) => void) | null>(
    null,
  );

  useEffect(() => {
    onRewardEarnedRef.current = options?.onRewardEarned;
  }, [options?.onRewardEarned]);

  useEffect(() => {
    let isMounted = true;

    // Dynamic import
    import("react-native-google-mobile-ads")
      .then((module) => {
        if (!isMounted) return;

        const { RewardedAd, RewardedAdEventType, AdEventType } = module;
        const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
          requestNonPersonalizedAdsOnly: false,
          keywords: [
            "games",
            "entertainment",
            "books",
            "reading",
            "manga",
            "comics",
          ],
        });

        const unsubscribeLoaded = ad.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            setIsLoaded(true);
            setIsLoading(false);
            setError(null);
          },
        );

        const unsubscribeEarned = ad.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          async () => {
            if (!userInitiatedShowRef.current) return;

            setIsEarned(true);
            earnedThisShowRef.current = true;
            await onRewardEarnedRef.current?.();
          },
        );

        const unsubscribeClosed = ad.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            setIsLoaded(false);
            setIsEarned(false);

            if (userInitiatedShowRef.current) {
              const earned = earnedThisShowRef.current;
              userInitiatedShowRef.current = false;
              earnedThisShowRef.current = false;
              showAdPromiseRef.current?.({ earned });
              showAdPromiseRef.current = null;
            }

            setIsLoading(true);
            ad.load();
          },
        );

        const unsubscribeError = ad.addAdEventListener(
          AdEventType.ERROR,
          (adError) => {
            console.error("Rewarded ad error:", adError);
            setError("Failed to load ad");
            setIsLoading(false);

            if (userInitiatedShowRef.current) {
              userInitiatedShowRef.current = false;
              earnedThisShowRef.current = false;
              showAdPromiseRef.current?.({ earned: false });
              showAdPromiseRef.current = null;
            }
          },
        );

        setIsLoading(true);
        ad.load();
        setRewardedAd(ad);

        return () => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          unsubscribeError();
        };
      })
      .catch((err) => {
        console.error("Failed to load ads module:", err);
        setError("Failed to load ads");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showAd = (): Promise<ShowAdResult> => {
    return new Promise((resolve) => {
      if (!rewardedAd || !isLoaded) {
        resolve({ earned: false });
        return;
      }

      showAdPromiseRef.current = resolve;
      userInitiatedShowRef.current = true;
      earnedThisShowRef.current = false;
      setIsLoaded(false);

      try {
        rewardedAd.show();
      } catch (adError) {
        console.error("Failed to show rewarded ad:", adError);
        userInitiatedShowRef.current = false;
        showAdPromiseRef.current = null;
        setError("Failed to show ad");
        resolve({ earned: false });
      }
    });
  };

  const loadAd = () => {
    if (rewardedAd && !isLoading) {
      setIsLoading(true);
      rewardedAd.load();
    }
  };

  return {
    isLoaded,
    isLoading,
    isEarned,
    error,
    showAd,
    loadAd,
  };
};
