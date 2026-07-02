import { Audiowide_400Regular, useFonts } from "@expo-google-fonts/audiowide";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen } from "../components/SplashScreen";
import { SecurityProvider } from "../context/SecurityContext";
import { ClerkProviderWrapper } from "../src/auth/clerk";
import { useChapterUnlockStore } from "../store/chapterUnlockStore";
import { useCoinStore } from "../store/coinStore";

function AppBootstrap() {
  const loadBalance = useCoinStore((s) => s.loadBalance);
  const hydrateUnlocks = useChapterUnlockStore((s) => s.hydrate);

  useEffect(() => {
    loadBalance();
    hydrateUnlocks();
  }, [loadBalance, hydrateUnlocks]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#121212" },
      }}
    >
      <Stack.Screen name="auth" options={{ headerShown: false }} />
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProviderWrapper>
        <SecurityProvider>
          <StatusBar style="light" />
          <AppBootstrap />
          {splashVisible && (
            <SplashScreen onAnimationEnd={() => setAnimationDone(true)} />
          )}
        </SecurityProvider>
      </ClerkProviderWrapper>
    </GestureHandlerRootView>
  );
}
