import { Account } from "appwrite";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { client } from "../../services/appwrite/config";
import { useThemeStore } from "../../store/themeStore";

const account = new Account(client);

export default function ResetPassword() {
  const router = useRouter();
  const { currentTheme } = useThemeStore();
  const { userId, secret, expire } = useLocalSearchParams<{
    userId: string;
    secret: string;
    expire: string;
  }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
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

    if (!userId || !secret) {
      Alert.alert("Error", "Invalid reset link");
      return;
    }

    setLoading(true);
    try {
      await account.updateRecovery(userId, secret, newPassword);
      Alert.alert("Success", "Password reset successfully");
      router.replace("/auth");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <CustomHeader title="Reset Password" showBack={true} />
      <ContentWithPadding>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.form}>
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
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </View>
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
});
