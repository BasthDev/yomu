import { useSignIn, useSignUp } from "@clerk/clerk-expo";
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
import { useThemeStore } from "../../store/themeStore";

export default function AuthScreen() {
  const { type } = useLocalSearchParams<{ type?: "signin" | "signup" }>();
  const router = useRouter();
  const { currentTheme } = useThemeStore();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const {
    signUp,
    setActive: setSignUpActive,
    isLoaded: signUpLoaded,
  } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(type === "signup");

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!signUpLoaded || !signUp) return;

        const result = await signUp.create({
          emailAddress: email,
          password,
        });

        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
          router.replace("/(tabs)");
        } else {
          Alert.alert("Sign up", "Please complete verification");
        }
      } else {
        if (!signInLoaded || !signIn) return;

        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace("/(tabs)");
        } else {
          Alert.alert("Sign in", "Please complete verification");
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.errors?.[0]?.message || err.message || "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Google OAuth will be configured in Clerk dashboard
    // This is a placeholder for the Google sign-in flow
    Alert.alert(
      "Google Sign In",
      "Configure Google OAuth in Clerk dashboard first",
    );
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
