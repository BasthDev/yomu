import { useThemeStore } from "@/store/themeStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { InteractionManager, Platform } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SplashScreen } from "../components/SplashScreen";
import { AdProvider } from "../context/AdContext";
import { SecurityProvider } from "../context/SecurityContext";
import { queryClient } from "../lib/queryClient";

import { useAppwriteAuthSync, useAuthStore } from "../store/authStore";

import { useChapterUnlockStore } from "../store/chapterUnlockStore";

import { useCoinStore } from "../store/coinStore";

import * as Database from "../utils/database";
import { DUMMY_BOOKS } from "../utils/dummyData";

// Keep native splash visible while JS loads
ExpoSplashScreen.preventAutoHideAsync();

let NavigationBar: any;

if (Platform.OS === "android") {
  NavigationBar = require("expo-navigation-bar");
}

function AppBootstrap() {
  useAppwriteAuthSync();

  const userId = useAuthStore((state) => state.userId);
  const firstName = useAuthStore((state) => state.firstName);
  const lastName = useAuthStore((state) => state.lastName);
  const email = useAuthStore((state) => state.email);

  const loadBalance = useCoinStore((state) => state.loadBalance);

  const hydrateUnlocks = useChapterUnlockStore((state) => state.hydrate);

  const resetUnlocks = useChapterUnlockStore((state) => state.reset);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      Database.initializeChapterReleaseDates(DUMMY_BOOKS);
    });

    return () => {
      task.cancel();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      useCoinStore.setState({
        balance: 0,
        isLoading: false,
      });

      resetUnlocks();

      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      loadBalance();

      hydrateUnlocks();
    });

    return () => {
      task.cancel();
    };
  }, [userId, firstName, lastName, email]);

  const { currentTheme, colorMode } = useThemeStore();

  return (
    <>
      <StatusBar style={colorMode === "dark" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,

          animation: "slide_from_right",

          contentStyle: {
            backgroundColor: currentTheme.background,
          },
        }}
      >
        <Stack.Screen name="auth/index" />

        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="book/[id]" />

        <Stack.Screen name="read/[chapterId]" />

        <Stack.Screen name="comments/[chapterId]" />

        <Stack.Screen name="test-ad" />
        <Stack.Screen name="user" />
      </Stack>
    </>
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

  // Hide native splash when React is ready
  useEffect(() => {
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Hide custom splash after animation
  useEffect(() => {
    if (fontsLoaded && animationDone) {
      setSplashVisible(false);
    }
  }, [fontsLoaded, animationDone]);

  // Safety fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationDone(true);
    }, 7000);

    return () => clearTimeout(timeout);
  }, []);

  // Android navigation bar
  useEffect(() => {
    if (Platform.OS === "android" && NavigationBar) {
      async function setup() {
        try {
          await NavigationBar.setPositionAsync("absolute");

          await NavigationBar.setVisibilityAsync("hidden");

          await NavigationBar.setButtonStyleAsync("light");
        } catch {}
      }

      setup();
    }
  }, []);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SecurityProvider>
          <AdProvider>
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
    </GestureHandlerRootView>
  );
}
