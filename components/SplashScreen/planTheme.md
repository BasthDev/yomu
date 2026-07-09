I want to improve my Expo React Native app (YOMU) so that when I build the final APK, Android native theme behavior is automatically generated through Expo config plugins.

Do NOT manually edit android/ files because they will be regenerated. Everything must be automated through app.json + Expo config plugins.

Current stack:

- Expo SDK 54
- React Native
- Expo Router
- TypeScript
- New Architecture enabled
- Zustand theme store
- Custom animated React Native SplashScreen
- Building final APK/AAB, not using Expo Go

Goal:

Create a production-ready native theme system.

Architecture:

1. Keep two layers of theme:

A. Android Native Theme Layer
Used before React Native starts:

- Native splash screen
- Android window background
- Status bar
- Navigation bar
- System dark/light mode support

B. React Native Theme Layer
Used after app starts:

- Zustand themeStore
- Custom themes:
  - Light
  - Dark
  - AMOLED
  - Sepia
  - Reader themes
  - Custom colors

The native layer should only handle basic:

- Light
- Dark

The React Native layer handles all advanced themes.

---

Implementation requirements:

Create an Expo config plugin:

Location:

plugins/
└── withAndroidTheme.js

Register it automatically in app.json:

plugins:
[
"expo-router",
"./plugins/withAndroidTheme"
]

The plugin should automatically generate/update:

android/app/src/main/res/values/styles.xml

android/app/src/main/res/values-night/styles.xml

android/app/src/main/res/values/colors.xml

android/app/src/main/res/values-night/colors.xml

Generate:

Light theme:

- Light window background
- Light status bar behavior
- Light splash background

Dark theme:

- Dark window background
- Dark status bar behavior
- Dark splash background

---

Splash system:

Keep expo-splash-screen.

Current splash:

image:
./assets/images/yomu-crop.png

Current background:
#0e0d0f

Improve it so:

Native splash:

- Fast startup
- Uses Android native resources
- Supports light/dark automatically

After React Native loads:

Show custom SplashScreen component:

Flow:

Android native splash
|
↓
React Native initializes
|
↓
Hide native splash
|
↓
Show custom animated YOMU splash
|
↓
Load Zustand theme
|
↓
Navigate to app

Do not remove the custom SplashScreen.

---

Theme persistence:

The selected theme from settings must persist.

Example:

User selects:

Dark Mode

Save:

theme = "dark"

Storage:

- Zustand persist
- AsyncStorage or SecureStore

On next launch:

Load saved theme before rendering the main UI.

---

Native communication:

If possible, create a native module:

React Native:

ThemeManager.setTheme("dark")

Android:

Save preference using SharedPreferences.

The Android activity should apply:

- dark/light window theme
- status bar color
- navigation bar color

---

Important:

Do not break:

- Expo Router
- Clerk authentication
- React Query
- expo-font loading
- expo-sqlite
- react-native-reanimated
- current SplashScreen animation

---

Deliver:

1. plugins/withAndroidTheme.js
2. Updated app.json plugin configuration
3. ThemeManager native module if required
4. Android Kotlin files
5. Updated themeStore integration example
6. Folder structure
7. Build instructions:

npx expo prebuild --clean

then:

npx expo run:android

or:

eas build --platform android

Explain why each file exists.
