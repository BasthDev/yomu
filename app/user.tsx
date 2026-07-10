import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "../components/Container";
import { ContentWithPadding } from "../components/Content";
import { CustomHeader } from "../components/Header";
import { authService } from "../services/appwrite/auth";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

export default function User() {
  const router = useRouter();
  const { currentTheme } = useThemeStore();
  const { email, userId, logout, setUserData } = useAuthStore();

  const [currentEmail, setCurrentEmail] = useState(email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "password">("email");

  const handleUpdateEmail = async () => {
    if (!newEmail || !currentPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newEmail === currentEmail) {
      Alert.alert("Error", "New email must be different from current email");
      return;
    }

    setLoading(true);
    try {
      await authService.updateEmail(newEmail, currentPassword);
      setUserData("", "", newEmail, "");
      setCurrentEmail(newEmail);
      setNewEmail("");
      setCurrentPassword("");
      Alert.alert("Success", "Email updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update password");
    } finally {
      setLoading(false);
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

  return (
    <Container>
      <CustomHeader title="Account" showBack={true} />
      <ContentWithPadding>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "email" && {
                  backgroundColor: currentTheme.primary,
                },
              ]}
              onPress={() => setActiveTab("email")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === "email" ? "#fff" : currentTheme.text,
                  },
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "password" && {
                  backgroundColor: currentTheme.primary,
                },
              ]}
              onPress={() => setActiveTab("password")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "password" ? "#fff" : currentTheme.text,
                  },
                ]}
              >
                Password
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Email Tab */}
            {activeTab === "email" && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Current Email
                  </Text>
                  <Text
                    style={[
                      styles.currentValue,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {currentEmail}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    New Email
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: currentTheme.background,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    placeholder="New Email"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: currentTheme.background,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    placeholder="Current Password"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: currentTheme.primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleUpdateEmail}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: "#fff" }]}>
                    {loading ? "Updating..." : "Update Email"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Current Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: currentTheme.background,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    placeholder="Current Password"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    New Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: currentTheme.background,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    placeholder="New Password (min 8 characters)"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Confirm New Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: currentTheme.background,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    placeholder="Confirm New Password"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: currentTheme.primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: "#fff" }]}>
                    {loading ? "Updating..." : "Update Password"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </ScrollView>
      </ContentWithPadding>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  currentValue: {
    fontSize: 16,
    paddingVertical: 12,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
