import { Audiowide_400Regular, useFonts } from "@expo-google-fonts/audiowide";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen } from "../components/SplashScreen";

export default function RootLayout() {
  // 1. Muat font seperti biasa
  const [fontsLoaded] = useFonts({
    Audiowide_400Regular,
  });

  const [splashVisible, setSplashVisible] = useState(true);

  // Fungsi pengecek saat animasi splash screen Anda selesai berjalan
  const handleAnimationEnd = () => {
    // 2. Kuncinya di sini: Hanya tutup splash screen JIKA font SUDAH selesai dimuat
    if (fontsLoaded) {
      setSplashVisible(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />

      {/* Stack halaman utama Anda tetap ada di latar belakang */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#121212" },
        }}
      />

      {/* 
        3. Tampilkan splash screen sejak detik pertama aplikasi dibuka.
        Splash screen akan tetap diam/menahan layar jika font belum siap dimuat.
      */}
      {splashVisible && <SplashScreen onAnimationEnd={handleAnimationEnd} />}
    </GestureHandlerRootView>
  );
}
