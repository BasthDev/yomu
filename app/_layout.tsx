import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen } from "../components/SplashScreen";
import { AdProvider } from "../context/AdContext";
import { SecurityProvider } from "../context/SecurityContext";
import { queryClient } from "../lib/queryClient";
import { useAuthStore, useClerkAuthSync } from "../store/authStore";
import { useChapterUnlockStore } from "../store/chapterUnlockStore";
import { useCoinStore } from "../store/coinStore";
import * as Database from "../utils/database";
import { DUMMY_BOOKS } from "../utils/dummyData";

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
    // Initialize chapter release dates in database
    Database.initializeChapterReleaseDates(DUMMY_BOOKS);
  }, []);

  const { user } = useUser();

  useEffect(() => {
    if (userId && user) {
      useCoinStore.getState().setClerkUser(user);
      loadBalance();
      hydrateUnlocks();
      return;
    }

    useCoinStore.setState({ balance: 0, isLoading: false, clerkUser: null });
    resetUnlocks();
  }, [userId, user, loadBalance, hydrateUnlocks, resetUnlocks]);

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
      <Stack.Screen name="test-ad" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Audiowide-Regular": require("../assets/fonts/Audiowide-Regular.ttf"),
    "Lora-Regular": require("../assets/fonts/Lora-Regular.ttf"),
    "Lora-Italic": require("../assets/fonts/Lora-Italic.ttf"),
    "Lora-Bold": require("../assets/fonts/Lora-Bold.ttf"),
    "Lora-BoldItalic": require("../assets/fonts/Lora-BoldItalic.ttf"),
    "Literata-Regular": require("../assets/fonts/Literata-VariableFont_opsz,wght.ttf"),
    "Literata-Italic": require("../assets/fonts/Literata-Italic-VariableFont_opsz,wght.ttf"),
    "Merriweather-Regular": require("../assets/fonts/Merriweather-VariableFont_opsz,wdth,wght.ttf"),
    "Merriweather-Italic": require("../assets/fonts/Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf"),
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
        <QueryClientProvider client={queryClient}>
          <SecurityProvider>
            <AdProvider>
              <StatusBar style="light" />
              <AppBootstrap />
              {splashVisible && (
                <SplashScreen
                  fontsLoaded={fontsLoaded}
                  onAnimationEnd={() => setAnimationDone(true)}
                />
              )}
            </AdProvider>
          </SecurityProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
