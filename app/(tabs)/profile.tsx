import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useThemeStore } from "../../store/themeStore";

export default function Profile() {
  const router = useRouter();
  const { currentTheme, themeName, setPresetTheme, colorMode, setColorMode } =
    useThemeStore();
  const { user } = useUser();
  const { signOut } = useAuth();

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const email = user?.emailAddresses[0]?.emailAddress || "";
  const [isUploading, setIsUploading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const handleImageUpload = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions",
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const uri = result.assets[0].uri;

        // Read the file as base64
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error("File does not exist");
        }

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });

        // Create a File object from base64
        const file = new File(
          [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
          "profile.jpg",
          { type: "image/jpeg" },
        );

        // Upload to Clerk
        await user?.setProfileImage({ file });

        Alert.alert("Success", "Profile image updated successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const themeColors = [
    { name: "Red", key: "red", color: "#E50914" },
    { name: "Blue", key: "blue", color: "#2196F3" },
    { name: "Green", key: "green", color: "#4CAF50" },
    { name: "Purple", key: "purple", color: "#9C27B0" },
    { name: "Orange", key: "orange", color: "#FF9800" },
    { name: "Pink", key: "pink", color: "#E91E63" },
    { name: "Teal", key: "teal", color: "#009688" },
    { name: "Gold", key: "gold", color: "#FFD700" },
  ];

  return (
    <Container>
      <CustomHeader
        title="Profile"
        showBack={false}
        showProfile={false}
        rightIcon={
          <View style={styles.logout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={currentTheme.text}
              onPress={handleSignOut}
            />
          </View>
        }
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ContentWithPadding style={styles.content}>
          {/* <View
            style={{
              padding: 20,
              backgroundColor: "#0e0d0f",
            }}
          >
            <Image
              source={require("@/assets/images/yomu-crop.png")}
              style={{
                width: 120,
                height: 120,
              }}
            />
          </View> */}
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={handleImageUpload}
              disabled={isUploading}
              style={styles.avatarContainer}
            >
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: currentTheme.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {firstName?.[0]?.toUpperCase() ||
                      email?.[0]?.toUpperCase() ||
                      "U"}
                  </Text>
                </View>
              )}
              {isUploading ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <View style={styles.avatarOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.avatarLabel, { color: currentTheme.text }]}>
              {firstName} {lastName}
            </Text>
            <Text
              style={[
                styles.avatarEmail,
                { color: currentTheme.textSecondary },
              ]}
            >
              {email}
            </Text>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Account
            </Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: currentTheme.border },
              ]}
              onPress={() => router.push("/(tabs)/user")}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={currentTheme.text}
              />
              <Text
                style={[styles.actionButtonText, { color: currentTheme.text }]}
              >
                Personal Information
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentTheme.textSecondary}
              />
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[
                styles.actionButton,
                styles.signOutButton,
                { borderColor: "#ef4444" },
              ]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text style={[styles.signOutButtonText, { color: "#ef4444" }]}>
                Sign Out
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* Theme Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Appearance
            </Text>

            {/* Dark/Light Mode Toggle */}
            <View style={styles.modeToggleContainer}>
              <Pressable
                style={[
                  styles.modeButton,
                  colorMode === "dark" && styles.selectedMode,
                  { borderColor: currentTheme.border },
                ]}
                onPress={() => setColorMode("dark")}
              >
                <Ionicons
                  name="moon"
                  size={20}
                  color={
                    colorMode === "dark"
                      ? currentTheme.primary
                      : currentTheme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color:
                        colorMode === "dark"
                          ? currentTheme.primary
                          : currentTheme.textSecondary,
                    },
                  ]}
                >
                  Dark
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modeButton,
                  colorMode === "light" && styles.selectedMode,
                  { borderColor: currentTheme.border },
                ]}
                onPress={() => setColorMode("light")}
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={
                    colorMode === "light"
                      ? currentTheme.primary
                      : currentTheme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color:
                        colorMode === "light"
                          ? currentTheme.primary
                          : currentTheme.textSecondary,
                    },
                  ]}
                >
                  Light
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Theme Color
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentTheme.textSecondary },
              ]}
            >
              Choose your preferred accent color
            </Text>

            <View style={styles.colorGrid}>
              {themeColors.map((theme) => (
                <Pressable
                  key={theme.key}
                  style={[
                    styles.colorButton,
                    themeName === theme.key && styles.selectedColor,
                    { backgroundColor: currentTheme.surface },
                  ]}
                  onPress={() => setPresetTheme(theme.key)}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: theme.color },
                    ]}
                  />
                  {themeName === theme.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.color}
                      style={styles.checkIcon}
                    />
                  )}
                  <Text
                    style={[styles.colorName, { color: currentTheme.text }]}
                  >
                    {theme.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ContentWithPadding>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarLabel: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  avatarEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 16,
  },
  modeToggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  selectedMode: {
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    borderWidth: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  signOutButton: {
    marginTop: 8,
  },
  signOutButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: "22.6%",
    height: 100,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#E50914",
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  checkIcon: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  colorName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  logout: {
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#ccc",
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
