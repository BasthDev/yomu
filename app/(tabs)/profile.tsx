import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { storageService } from "../../services/appwrite/storage";
import { profileRepository } from "../../services/repositories/appwriteProfileRepository";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function Profile() {
  const router = useRouter();
  const { currentTheme, themeName, setPresetTheme, colorMode, setColorMode } =
    useThemeStore();
  const { firstName, lastName, email, userId, logout } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    try {
      const profileData = await profileRepository.getProfileByUserId(userId);
      setProfile(profileData);
      if (profileData) {
        setBio(profileData.bio || "");
        setWebsite(profileData.website || "");
        setAvatarUri(profileData.avatar_url || null);

        // Parse social links JSON
        try {
          const links = JSON.parse(profileData.social_links || "{}");
          setInstagram(links.instagram || "");
          setTiktok(links.tiktok || "");
          setTwitter(links.twitter || "");
          setYoutube(links.youtube || "");
        } catch (e) {
          console.error("Error parsing social links:", e);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to upload an avatar",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      } as any);

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        try {
          const fileInfo = result.assets[0];

          const uploadedFileId = await storageService.uploadFile("avatars", {
            uri: fileInfo.uri,
            type: fileInfo.type || "image/jpeg",
            name: fileInfo.fileName || `avatar_${Date.now()}.jpg`,
            size: fileInfo.fileSize || 0,
          });

          const fileUrl = storageService.getFileView("avatars", uploadedFileId);

          if (profile) {
            await profileRepository.updateProfile(profile.$id, {
              avatar_url: fileUrl,
            });
            setAvatarUri(fileUrl);
            await loadProfile();
          }
        } catch (error) {
          console.error("Error uploading avatar:", error);
          Alert.alert("Error", "Failed to upload avatar");
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      // Combine social links to JSON
      const socialLinksJson = JSON.stringify({
        instagram: instagram,
        tiktok: tiktok,
        twitter: twitter,
        youtube: youtube,
      });

      await profileRepository.updateProfile(profile.$id, {
        display_name: `${firstName} ${lastName}`,
        bio: bio,
        website: website,
        social_links: socialLinksJson,
      });
      setEditing(false);
      await loadProfile();
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/auth");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
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
          {/* Avatar Section */}
          <View
            style={[
              styles.avatarSection,
              { backgroundColor: currentTheme.surface },
            ]}
          >
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
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
              <TouchableOpacity
                style={[
                  styles.editAvatarButton,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={pickImage}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <Ionicons name="hourglass" size={16} color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.avatarLabel, { color: currentTheme.text }]}>
              {`${firstName} ${lastName}`}
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

          {/* Profile Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Profile Information
              </Text>
              <TouchableOpacity
                onPress={() => setEditing(!editing)}
                style={styles.editButton}
              >
                <Ionicons
                  name={editing ? "close" : "create-outline"}
                  size={20}
                  color={currentTheme.primary}
                />
              </TouchableOpacity>
            </View>

            {editing ? (
              <>
                <View style={styles.inputContainer}>
                  <Text
                    style={[styles.inputLabel, { color: currentTheme.text }]}
                  >
                    Bio
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        color: currentTheme.text,
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={currentTheme.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[styles.inputLabel, { color: currentTheme.text }]}
                  >
                    Website
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: currentTheme.text,
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    value={website}
                    onChangeText={setWebsite}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor={currentTheme.textSecondary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[styles.inputLabel, { color: currentTheme.text }]}
                  >
                    Instagram
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      {
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="logo-instagram"
                      size={20}
                      color={currentTheme.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputWithIconText,
                        { color: currentTheme.text },
                      ]}
                      value={instagram}
                      onChangeText={setInstagram}
                      placeholder="@username"
                      placeholderTextColor={currentTheme.textSecondary}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[styles.inputLabel, { color: currentTheme.text }]}
                  >
                    TikTok
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      {
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="logo-tiktok"
                      size={20}
                      color={currentTheme.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputWithIconText,
                        { color: currentTheme.text },
                      ]}
                      value={tiktok}
                      onChangeText={setTiktok}
                      placeholder="@username"
                      placeholderTextColor={currentTheme.textSecondary}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[styles.inputLabel, { color: currentTheme.text }]}
                  >
                    Twitter/X
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      {
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="logo-x"
                      size={20}
                      color={currentTheme.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputWithIconText,
                        { color: currentTheme.text },
                      ]}
                      value={twitter}
                      onChangeText={setTwitter}
                      placeholder="@username"
                      placeholderTextColor={currentTheme.textSecondary}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[styles.inputLabel, { color: currentTheme.text }]}
                  >
                    YouTube
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      {
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="logo-youtube"
                      size={20}
                      color={currentTheme.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.inputWithIconText,
                        { color: currentTheme.text },
                      ]}
                      value={youtube}
                      onChangeText={setYoutube}
                      placeholder="channel URL"
                      placeholderTextColor={currentTheme.textSecondary}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: currentTheme.primary },
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {profile?.bio && (
                  <View style={styles.infoRow}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Bio
                    </Text>
                    <Text
                      style={[styles.infoValue, { color: currentTheme.text }]}
                    >
                      {profile.bio}
                    </Text>
                  </View>
                )}

                {profile?.website && (
                  <View style={styles.infoRow}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Website
                    </Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(profile.website)}
                    >
                      <Text
                        style={[
                          styles.infoValueLink,
                          { color: currentTheme.primary },
                        ]}
                      >
                        {profile.website}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Social Links Display */}
                {(instagram || tiktok || twitter || youtube) && (
                  <View style={styles.socialLinksContainer}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Social Links
                    </Text>
                    <View style={styles.socialLinksGrid}>
                      {instagram && (
                        <TouchableOpacity
                          style={styles.socialLinkItem}
                          onPress={() =>
                            Linking.openURL(
                              `https://instagram.com/${instagram.replace("@", "")}`,
                            )
                          }
                        >
                          <Ionicons
                            name="logo-instagram"
                            size={24}
                            color={currentTheme.primary}
                          />
                          <Text
                            style={[
                              styles.socialLinkText,
                              { color: currentTheme.text },
                            ]}
                          >
                            {instagram}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {tiktok && (
                        <TouchableOpacity
                          style={styles.socialLinkItem}
                          onPress={() =>
                            Linking.openURL(
                              `https://tiktok.com/@${tiktok.replace("@", "")}`,
                            )
                          }
                        >
                          <Ionicons
                            name="logo-tiktok"
                            size={24}
                            color={currentTheme.primary}
                          />
                          <Text
                            style={[
                              styles.socialLinkText,
                              { color: currentTheme.text },
                            ]}
                          >
                            {tiktok}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {twitter && (
                        <TouchableOpacity
                          style={styles.socialLinkItem}
                          onPress={() =>
                            Linking.openURL(
                              `https://twitter.com/${twitter.replace("@", "")}`,
                            )
                          }
                        >
                          <Ionicons
                            name="logo-x"
                            size={24}
                            color={currentTheme.primary}
                          />
                          <Text
                            style={[
                              styles.socialLinkText,
                              { color: currentTheme.text },
                            ]}
                          >
                            {twitter}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {youtube && (
                        <TouchableOpacity
                          style={styles.socialLinkItem}
                          onPress={() => Linking.openURL(youtube)}
                        >
                          <Ionicons
                            name="logo-youtube"
                            size={24}
                            color={currentTheme.primary}
                          />
                          <Text
                            style={[
                              styles.socialLinkText,
                              { color: currentTheme.text },
                            ]}
                          >
                            {youtube}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {!profile?.bio &&
                  !profile?.website &&
                  !instagram &&
                  !tiktok &&
                  !twitter &&
                  !youtube && (
                    <Text
                      style={[
                        styles.noInfoText,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      No profile information added yet. Tap the edit icon to add
                      your bio, website, and social links.
                    </Text>
                  )}
              </>
            )}
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
              onPress={() => router.push("../user")}
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
          </View>

          {/* Theme Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Appearance
            </Text>

            {/* Dark/Light Mode Toggle */}
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity
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
              </TouchableOpacity>

              <TouchableOpacity
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
              </TouchableOpacity>
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

            {/* Color Dropdown */}
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                {
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.surface,
                },
              ]}
              onPress={() => setColorDropdownOpen(!colorDropdownOpen)}
            >
              <View style={styles.selectedColorDisplay}>
                <View
                  style={[
                    styles.colorCircleSmall,
                    {
                      backgroundColor:
                        themeColors.find((t) => t.key === themeName)?.color ||
                        currentTheme.primary,
                    },
                  ]}
                />
                <Text
                  style={[styles.dropdownText, { color: currentTheme.text }]}
                >
                  {themeColors.find((t) => t.key === themeName)?.name ||
                    "Default"}
                </Text>
              </View>
              <Ionicons
                name={colorDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={currentTheme.textSecondary}
              />
            </TouchableOpacity>

            {colorDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: currentTheme.surface,
                    borderColor: currentTheme.border,
                  },
                ]}
              >
                {themeColors.map((theme) => (
                  <TouchableOpacity
                    key={theme.key}
                    style={[
                      styles.dropdownItem,
                      themeName === theme.key && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setPresetTheme(theme.key);
                      setColorDropdownOpen(false);
                    }}
                  >
                    <View
                      style={[
                        styles.colorCircleSmall,
                        { backgroundColor: theme.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: currentTheme.text },
                      ]}
                    >
                      {theme.name}
                    </Text>
                    {themeName === theme.key && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={currentTheme.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
    borderRadius: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 12,
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
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  websiteText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    borderWidth: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoValueLink: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  noInfoText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  selectedColorDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
  },
  socialLinksContainer: {
    marginTop: 16,
  },
  socialLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  socialLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  socialLinkText: {
    fontSize: 13,
    fontWeight: "500",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
