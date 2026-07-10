import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { authService } from "../../services/appwrite/auth";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function AuthScreen() {
  const { type } = useLocalSearchParams<{ type?: "signin" | "signup" }>();
  const router = useRouter();
  const { currentTheme } = useThemeStore();
  const { isAuthenticated, checkAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(type === "signup");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await authService.signUp(email, password, name);
        Alert.alert("Success", "Account created successfully!");
        router.replace("/(tabs)");
      } else {
        await authService.signIn(email, password);
        Alert.alert("Success", "Signed in successfully!");
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert("Google Sign In", "Coming soon - configure Appwrite OAuth");
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text
              style={[styles.subtitle, { color: currentTheme.textSecondary }]}
            >
              {isSignUp ? "Sign up to start reading" : "Sign in to continue"}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: currentTheme.text }]}>
                  Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: currentTheme.background,
                      color: currentTheme.text,
                      borderColor: currentTheme.textSecondary + "30",
                    },
                  ]}
                  placeholder="Enter your name"
                  placeholderTextColor={currentTheme.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: currentTheme.textSecondary + "30",
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={currentTheme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
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
                    borderColor: currentTheme.textSecondary + "30",
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={currentTheme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.primary }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.googleButton,
                { backgroundColor: "#fff", borderColor: "#ddd" },
              ]}
              onPress={handleGoogleSignIn}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: currentTheme.textSecondary }]}
            >
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text
                style={[styles.footerLink, { color: currentTheme.primary }]}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  googleButton: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 10,
  },
  googleButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
