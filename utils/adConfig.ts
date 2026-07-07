export const AD_UNIT_IDS = {
  REWARDED: __DEV__
    ? "ca-app-pub-3940256099942544/5224354917" // Test rewarded ad
    : "ca-app-pub-7279615482242846/4810280021", // Production rewarded ad
  REWARDED_INTERSTITIAL: __DEV__
    ? "ca-app-pub-3940256099942544/5354046379" // Test rewarded interstitial ad
    : "ca-app-pub-7279615482242846/2910874990", // Production rewarded interstitial ad
};

export const AD_REWARDS = {
  REWARDED_COINS: 15,
  INTERSTITIAL_COINS: 25,
};

export const CHAPTERS_PER_BONUS_AD = 3;
