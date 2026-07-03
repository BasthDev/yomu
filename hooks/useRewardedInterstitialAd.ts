import { useEffect, useRef, useState } from "react";
import {
  AdEventType,
  RewardedAdEventType,
  RewardedInterstitialAd,
} from "react-native-google-mobile-ads";
import { useCoinStore } from "../store/coinStore";
import { AD_UNIT_IDS } from "../utils/adConfig";

type ShowAdResult = { earned: boolean };

export const useRewardedInterstitialAd = () => {
  const [rewardedInterstitialAd, setRewardedInterstitialAd] =
    useState<RewardedInterstitialAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchInterstitialAd = useCoinStore(
    (state) => state.watchInterstitialAd,
  );
  const userInitiatedShowRef = useRef(false);
  const earnedThisShowRef = useRef(false);
  const showAdPromiseRef = useRef<((result: ShowAdResult) => void) | null>(
    null,
  );

  useEffect(() => {
    const ad = RewardedInterstitialAd.createForAdRequest(
      AD_UNIT_IDS.REWARDED_INTERSTITIAL,
      {
        requestNonPersonalizedAdsOnly: false,
        keywords: ["books", "reading", "manga", "comics"],
      },
    );

    setRewardedInterstitialAd(ad);

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
        await watchInterstitialAd();
      },
    );

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
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
    });

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (adError) => {
        console.error("Rewarded interstitial ad error:", adError);
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

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [watchInterstitialAd]);

  const showAd = (): Promise<ShowAdResult> => {
    return new Promise((resolve) => {
      if (!isLoaded || !rewardedInterstitialAd) {
        resolve({ earned: false });
        return;
      }

      showAdPromiseRef.current = resolve;
      userInitiatedShowRef.current = true;
      earnedThisShowRef.current = false;
      setIsLoaded(false);

      try {
        rewardedInterstitialAd.show();
      } catch (adError) {
        console.error("Failed to show rewarded interstitial ad:", adError);
        userInitiatedShowRef.current = false;
        showAdPromiseRef.current = null;
        setError("Failed to show ad");
        resolve({ earned: false });
      }
    });
  };

  return {
    isLoaded,
    isEarned,
    isLoading,
    error,
    showAd,
  };
};
