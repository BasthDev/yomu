import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { useClerkAuthSync } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function TabsLayout() {
  const { currentTheme, loadTheme } = useThemeStore();
  const { isLoaded, isSignedIn } = useAuth();

  // Sync Clerk auth state with our store
  useClerkAuthSync();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/auth" />;

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
          height: 60,
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
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
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="wallet"
        options={{
          // title: "Wallet",
          // tabBarIcon: ({ color }) => (
          //   <Ionicons name="wallet" size={24} color={color} />
          // ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
