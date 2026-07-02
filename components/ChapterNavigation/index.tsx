import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "../../store/themeStore";

// 1. Daftarkan properti 'currentChapterNumber' ke dalam interface props
interface ChapterNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentChapterNumber?: number; // Tambahkan baris ini (opsional agar aman)
}

export function ChapterNavigation({
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  currentChapterNumber = 1, // Beri nilai default 1 jika tidak dikirim
}: ChapterNavigationProps) {
  const { currentTheme } = useThemeStore();

  return (
    <View style={styles.navigationContainer}>
      {/* Tombol Prev */}
      <TouchableOpacity
        style={[styles.prevButton, !hasPrev && styles.disabledButton]}
        onPress={onPrev}
        disabled={!hasPrev}
        activeOpacity={0.7}
      >
        <Text style={[styles.prevButtonText, !hasPrev && styles.disabledText]}>
          {/* Teks dinamis untuk tombol Prev */}
          {hasPrev ? `Chapter ${currentChapterNumber - 1}` : "First Chapter"}
        </Text>
      </TouchableOpacity>

      {/* Tombol Next */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          !hasNext && styles.disabledButton,
          {
            backgroundColor: currentTheme.primary,
            shadowColor: currentTheme.primary,
          },
        ]}
        onPress={onNext}
        disabled={!hasNext}
        activeOpacity={0.7}
      >
        <Text style={styles.nextButtonText}>
          {/* Teks dinamis untuk tombol Next */}
          {hasNext ? `Chapter ${currentChapterNumber + 1}` : "Last Chapter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 40,
  },
  prevButton: {
    flex: 1,
    backgroundColor: "#333333",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  prevButtonText: {
    color: "#aaaaaa",
    fontSize: 15,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "red",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#1e1e1e",
    borderColor: "rgba(255, 255, 255, 0.02)",
    opacity: 0.5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledText: {
    color: "#555555",
  },
});
