import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Audiowide_400Regular, useFonts } from "@expo-google-fonts/audiowide";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen } from "../components/SplashScreen";
import { SecurityProvider } from "../context/SecurityContext";
import { useAuthStore, useClerkAuthSync } from "../store/authStore";
import { useChapterUnlockStore } from "../store/chapterUnlockStore";
import { useCoinStore } from "../store/coinStore";

// Only import NavigationBar on Android
let NavigationBar: any;
if (Platform.OS === "android") {
  NavigationBar = require("expo-navigation-bar");
}

function AppBootstrap() {
  useClerkAuthSync();

  const userId = useAuthStore((state) => state.userId);
  const loadBalance = useCoinStore((s) => s.loadBalance);
  const hydrateUnlocks = useChapterUnlockStore((s) => s.hydrate);
  const resetUnlocks = useChapterUnlockStore((s) => s.reset);

  useEffect(() => {
    if (userId) {
      loadBalance();
      hydrateUnlocks();
      return;
    }

    useCoinStore.setState({ balance: 0, isLoading: false });
    resetUnlocks();
  }, [userId, loadBalance, hydrateUnlocks, resetUnlocks]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#121212" },
      }}
    >
      <Stack.Screen name="auth/index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="read/[chapterId]" />
      <Stack.Screen name="comments/[chapterId]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Audiowide_400Regular,
  });

  const [splashVisible, setSplashVisible] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded && animationDone) {
      setSplashVisible(false);
    }
  }, [fontsLoaded, animationDone]);

  // Fallback: never block the app if fonts fail to load
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationDone(true);
      setSplashVisible(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Hide native navigation bar on app launch
  useEffect(() => {
    if (Platform.OS === "android" && NavigationBar) {
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <SecurityProvider>
          <StatusBar style="light" />
          <AppBootstrap />
          {splashVisible && (
            <SplashScreen onAnimationEnd={() => setAnimationDone(true)} />
          )}
        </SecurityProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
