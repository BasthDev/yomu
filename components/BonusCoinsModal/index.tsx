import { AD_REWARDS } from "@/utils/adConfig";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BonusCoinsModalProps {
  visible: boolean;
  onSkip: () => void;
  onWatchAd: () => void;
  isAdLoaded: boolean;
  isAdLoading: boolean;
  theme: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
  };
}

export function BonusCoinsModal({
  visible,
  onSkip,
  onWatchAd,
  isAdLoaded,
  isAdLoading,
  theme,
}: BonusCoinsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.content, { backgroundColor: theme.background }]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Ionicons name="gift" size={36} color={theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Bonus Coins!
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            You have read 3 chapters. Watch a short ad to earn{" "}
            {AD_REWARDS.INTERSTITIAL_COINS} bonus coins.
          </Text>

          <View style={styles.progressRow}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  { backgroundColor: theme.primary },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
                opacity: isAdLoaded && !isAdLoading ? 1 : 0.6,
              },
            ]}
            onPress={onWatchAd}
            disabled={!isAdLoaded || isAdLoading}
          >
            {isAdLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="play-circle" size={22} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  Watch Ad (+{AD_REWARDS.INTERSTITIAL_COINS} coins)
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.surface }]}
            onPress={onSkip}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Skip for now
            </Text>
          </TouchableOpacity>

          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Skipping will reset progress. The next offer appears after 3 more
            chapters.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
