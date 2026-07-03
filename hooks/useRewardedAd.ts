import { useEffect, useState } from "react";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { useCoinStore } from "../store/coinStore";
import { AD_UNIT_IDS } from "../utils/adConfig";

export const useRewardedAd = () => {
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { watchRewardAd } = useCoinStore();

  useEffect(() => {
    // Create rewarded ad
    const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ["games", "entertainment", "books", "reading"],
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
      async (reward) => {
        console.log("User earned reward:", reward);
        setIsEarned(true);
        // Add coins when reward is earned
        await watchRewardAd();
      },
    );

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      setIsEarned(false);
      // Preload next ad
      ad.load();
    });

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error("Rewarded ad error:", error);
        setError("Failed to load ad");
        setIsLoading(false);
      },
    );

    // Load initial ad
    setIsLoading(true);
    ad.load();

    setRewardedAd(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [watchRewardAd]);

  const showAd = () => {
    if (rewardedAd && isLoaded) {
      rewardedAd.show();
      return true;
    }
    return false;
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
