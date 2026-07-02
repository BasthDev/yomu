import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useThemeStore } from "../../store/themeStore";

export default function TabsLayout() {
  const { currentTheme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: currentTheme.textSecondary,
        tabBarStyle: {
          backgroundColor: currentTheme.background,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          // Perbaikan Icon: Gunakan prop 'color' dan 'focused' bawaan Expo Router
          // agar warna ikon otomatis berubah abu-abu saat tidak aktif
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <Ionicons name="time" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title: "Bookmark",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bookmark" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />

      {/* 
        Halaman Baca: Disembunyikan dari daftar menu 
        DAN bottom bar dihilangkan total saat dibuka
      */}
      <Tabs.Screen
        name="read/[chapterId]"
        options={{
          href: null,
          tabBarStyle: { display: "none" }, // Kuncinya di sini!
        }}
      />

      {/* 
        Halaman Detail Buku: Disembunyikan dari daftar menu 
        DAN bottom bar dihilangkan total saat dibuka
      */}
      <Tabs.Screen
        name="book/[id]"
        options={{
          href: null,
          tabBarStyle: { display: "none" }, // Kuncinya di sini!
        }}
      />
    </Tabs>
  );
}
