# AdMob Integration Setup for Yomu

## Overview
This document explains how to set up and use Google AdMob in the Yomu app.

## Prerequisites
1. Create an AdMob account at [https://admob.google.com](https://admob.google.com)
2. Create an app in AdMob dashboard
3. Create ad units (Banner, Interstitial, Rewarded)

## Step 1: Get AdMob App IDs

After creating your app in AdMob, you'll receive:
- **Android App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
- **iOS App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ`

## Step 2: Update app.json

Replace the placeholder App IDs in `app.json`:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
    "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
  }
]
```

## Step 3: Create Ad Units

In your AdMob dashboard, create these ad units:

### Banner Ads
- **Format**: Banner (320x50 or Adaptive)
- **Name**: Home Banner
- **Ad Unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA`

### Interstitial Ads
- **Format**: Interstitial
- **Name**: Chapter Unlock Interstitial
- **Ad Unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB`

### Rewarded Ads
- **Format**: Rewarded
- **Name**: Coin Reward
- **Ad Unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/CCCCCCCCCC`

## Step 4: Configure Ad Unit IDs

Create a configuration file `utils/adConfig.ts`:

```typescript
export const AD_UNIT_IDS = {
  BANNER: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test banner
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA',
  
  INTERSTITIAL: __DEV__
    ? 'ca-app-pub-3940256099942544/1033173712' // Test interstitial
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB',
  
  REWARDED: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test rewarded
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/CCCCCCCCCC',
};
```

## Step 5: Using Ads in Your App

### Banner Ad Example
```typescript
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../../utils/adConfig';

<BannerAd
  unitId={AD_UNIT_IDS.BANNER}
  size={BannerAdSize.ADAPTIVE_BANNER}
  requestOptions={{
    requestNonPersonalizedAdsOnly: true,
  }}
/>
```

### Interstitial Ad Example
```typescript
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../../utils/adConfig';

const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

useEffect(() => {
  const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial.show();
  });

  interstitial.load();

  return unsubscribe;
}, []);
```

### Rewarded Ad Example
```typescript
import { RewardedAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../../utils/adConfig';

const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
  requestNonPersonalizedAdsOnly: true,
});

useEffect(() => {
  const unsubscribeLoaded = rewarded.addAdEventListener(AdEventType.LOADED, () => {
    rewarded.show();
  });
  
  const unsubscribeEarned = rewarded.addAdEventListener(AdEventType.EARNED_REWARD, (reward) => {
    console.log('User earned reward:', reward);
  });

  rewarded.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeEarned();
  };
}, []);
```

## Step 6: Rebuild the App

After configuring AdMob, rebuild your app:

```bash
npx expo prebuild --clean
npx expo run:android
# or
npx expo run:ios
```

## Testing

### Test Mode
The app uses test ad IDs when in development mode (`__DEV__` is true). These are Google's official test ad units.

### Production
When building for production, ensure you:
1. Replace test IDs with your actual Ad Unit IDs
2. Test with real ads (small amount first)
3. Monitor ad performance in AdMob dashboard

## Best Practices

1. **Don't show too many ads** - Respect user experience
2. **Test thoroughly** - Use test mode during development
3. **Monitor performance** - Check fill rate and eCPM in AdMob
4. **Comply with policies** - Follow AdMob content policies
5. **User consent** - Implement GDPR/CCPA consent if needed

## Ad Placement Recommendations

- **Home Screen**: Banner at bottom
- **Chapter Unlock**: Interstitial before unlocking
- **Coin Reward**: Rewarded ad for earning coins
- **Between Chapters**: Interstitial every 3-5 chapters

## Troubleshooting

### Ads not showing
- Check if App IDs are correct in app.json
- Ensure ad unit IDs match your AdMob dashboard
- Verify internet connection
- Check console for errors

### Build errors
- Run `npx expo prebuild --clean`
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Resources

- [AdMob Documentation](https://developers.google.com/admob)
- [React Native Google Mobile Ads](https://github.com/invertase/react-native-google-mobile-ads)
- [AdMob Policies](https://support.google.com/admob/answer/9042145)
