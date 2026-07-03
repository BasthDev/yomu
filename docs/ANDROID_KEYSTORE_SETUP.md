# Android Keystore Setup for Yomu

## Overview
This document explains how to set up a release keystore for signing the Yomu Android app.

## Method 1: Using EAS Build (Recommended)

### Step 1: Generate Keystore
Run the keystore generation script:
```bash
cd scripts
bash generate-keystore.sh
```

### Step 2: Store Credentials Securely
Add the keystore credentials to your environment variables or `.env` file:
```env
EXPO_ANDROID_KEYSTORE_PASSWORD=your-keystore-password
EXPO_ANDROID_KEY_PASSWORD=your-keystore-password
```

### Step 3: Configure EAS Build
The `eas.json` file is already configured for production builds with app-bundle.

### Step 4: Build Production APK/AAB
```bash
eas build --platform android --profile production
```

## Method 2: Local Build with Keystore

### Step 1: Generate Keystore
```bash
keytool -genkey -v -keystore android/app/release.keystore -alias yomu-release-key -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Configure gradle.properties
Add to `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=yomu-release-key
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_PASSWORD=your-keystore-password
```

### Step 3: Configure build.gradle
Update `android/app/build.gradle` signing config:
```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

### Step 4: Build Release APK/AAB
```bash
cd android
./gradlew assembleRelease
# or
./gradlew bundleRelease
```

## Important Notes

- **Never commit the keystore file to git** - it's already in `.gitignore`
- **Store passwords securely** - use environment variables or secure storage
- **Backup your keystore** - if lost, you cannot update your app
- **Keep the keystore safe** - anyone with access can sign malicious apps

## Keystore Location
The release keystore should be placed at:
```
android/app/release.keystore
```

## Troubleshooting

### Keystore already exists
Remove the existing keystore first:
```bash
rm android/app/release.keystore
```

### Build fails with signing error
Verify all credentials in `gradle.properties` match your keystore.

### EAS Build fails
Ensure environment variables are set correctly in your EAS project settings.
