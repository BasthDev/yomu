import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { Image, Platform, Text, View } from "react-native";
import { useAppwriteAuthSync } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function TabsLayout() {
  const { currentTheme, loadTheme } = useThemeStore();

  const { imageUrl, firstName, lastName, email, isAuthenticated, isLoading } =
    useAuthStore();

  // Sync Appwrite auth state with our store
  useAppwriteAuthSync();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  if (isLoading) return null;

  if (!isAuthenticated) return <Redirect href="/auth" />;

  const getInitials = () => {
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

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
          height: Platform.OS === "ios" ? 80 : 60,
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
          tabBarIcon: ({ focused }) =>
            imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: focused ? 1 : 0,
                  borderColor: currentTheme.primary,
                }}
              />
            ) : (
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: currentTheme.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: focused ? 1 : 0,
                  borderColor: currentTheme.primary,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {getInitials()}
                </Text>
              </View>
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
