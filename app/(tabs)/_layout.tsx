import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { useThemeStore } from "../../store/themeStore";

export default function TabsLayout() {
  const { currentTheme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return (
    <AuthGuard>
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
      </Tabs>
    </AuthGuard>
  );
}
