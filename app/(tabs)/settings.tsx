import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useThemeStore } from "../../store/themeStore";

export default function Settings() {
  const router = useRouter();
  const { currentTheme, themeName, setPresetTheme } = useThemeStore();

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
      <CustomHeader title="Settings" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ContentWithPadding style={styles.content}>
          <View style={styles.section}>
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
                  <Text style={styles.colorName}>{theme.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Current Theme
            </Text>
            <View style={styles.themePreview}>
              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: currentTheme.primary },
                ]}
              >
                <Text style={styles.previewLabel}>Primary</Text>
              </View>
              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: currentTheme.background },
                ]}
              >
                <Text
                  style={[styles.previewLabel, { color: currentTheme.text }]}
                >
                  Background
                </Text>
              </View>
              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: currentTheme.surface },
                ]}
              >
                <Text
                  style={[styles.previewLabel, { color: currentTheme.text }]}
                >
                  Surface
                </Text>
              </View>
            </View>
          </View> */}
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: "22.6%",
    height: 100,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#fff",
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
  themePreview: {
    gap: 8,
  },
  previewBox: {
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  previewLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
