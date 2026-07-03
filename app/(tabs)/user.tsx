import { useAuth, useUser } from "@clerk/expo";
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
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useThemeStore } from "../../store/themeStore";

export default function User() {
  const router = useRouter();
  const { currentTheme } = useThemeStore();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress || "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "email" | "password">(
    "profile",
  );

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await user?.update({
        firstName,
        lastName,
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email || !currentPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Create new email address
      await user?.createEmailAddress({
        email,
      });

      Alert.alert(
        "Success",
        "Verification email sent. Please check your inbox to verify your new email address.",
      );
      setCurrentPassword("");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.message || err.message || "Failed to update email",
      );
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
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert("Success", "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.message || err.message || "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
                activeTab === "profile" && {
                  backgroundColor: currentTheme.primary,
                },
              ]}
              onPress={() => setActiveTab("profile")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profile" && { color: "#fff" },
                  {
                    color: activeTab === "profile" ? "#fff" : currentTheme.text,
                  },
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
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
                  { color: activeTab === "email" ? "#fff" : currentTheme.text },
                ]}
              >
                Email
              </Text>
            </TouchableOpacity> */}
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
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    First Name
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
                    placeholder="First Name"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: currentTheme.text }]}>
                    Last Name
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
                    placeholder="Last Name"
                    placeholderTextColor={currentTheme.textSecondary}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: currentTheme.primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: "#fff" }]}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Email Tab */}
            {activeTab === "email" && (
              <View style={styles.form}>
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
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

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

            {/* Sign Out */}
            {/* <TouchableOpacity
              style={[styles.signOutButton, { borderColor: "#ef4444" }]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text style={[styles.signOutButtonText, { color: "#ef4444" }]}>
                Sign Out
              </Text>
            </TouchableOpacity> */}
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
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
  },
  signOutButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
});
