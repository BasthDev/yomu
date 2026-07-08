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

interface UnlockModalProps {
  visible: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onUnlockWithAd?: () => void;
  chapterCost: number;
  balance: number;
  isUnlocking: boolean;
  isAdLoading?: boolean;
  daysUntilFree?: number;
  theme: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
  };
}

export function UnlockModal({
  visible,
  onClose,
  onUnlock,
  onUnlockWithAd,
  chapterCost,
  balance,
  isUnlocking,
  isAdLoading,
  daysUntilFree,
  theme,
}: UnlockModalProps) {
  const canAfford = balance >= chapterCost;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          {/* Loading overlay while unlocking */}
          {isUnlocking && (
            <View
              style={[
                styles.loadingOverlay,
                { backgroundColor: theme.background },
              ]}
            >
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Unlocking chapter...
              </Text>
            </View>
          )}

          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Chapter Locked
          </Text>
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            You need to unlock this chapter to read it.
          </Text>

          <View style={styles.unlockOptions}>
            {/* Coin unlock */}
            <TouchableOpacity
              style={[
                styles.unlockOption,
                { backgroundColor: theme.surface },
                !canAfford && styles.unlockOptionDisabled,
              ]}
              onPress={onUnlock}
              disabled={isUnlocking || !canAfford}
              activeOpacity={0.7}
            >
              <Ionicons
                name="wallet"
                size={24}
                color={canAfford ? theme.primary : theme.textSecondary}
              />
              <View style={styles.unlockOptionText}>
                <Text style={[styles.unlockOptionTitle, { color: theme.text }]}>
                  Unlock with Coins
                </Text>
                <Text
                  style={[
                    styles.unlockOptionSubtitle,
                    {
                      color: canAfford ? theme.textSecondary : "#e53935",
                    },
                  ]}
                >
                  {canAfford
                    ? `${chapterCost} coins (You have ${balance})`
                    : `Need ${chapterCost} coins (You only have ${balance})`}
                </Text>
              </View>
              {canAfford && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.textSecondary}
                />
              )}
            </TouchableOpacity>

            {/* Ad unlock */}
            {onUnlockWithAd && (
              <TouchableOpacity
                style={[
                  styles.unlockOption,
                  { backgroundColor: theme.surface },
                  (isAdLoading || isUnlocking) && styles.unlockOptionDisabled,
                ]}
                onPress={onUnlockWithAd}
                disabled={isAdLoading || isUnlocking}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="play-circle"
                  size={24}
                  color={isAdLoading ? theme.textSecondary : "#ff6b6b"}
                />
                <View style={styles.unlockOptionText}>
                  <Text
                    style={[styles.unlockOptionTitle, { color: theme.text }]}
                  >
                    Unlock with Ad
                  </Text>
                  <Text
                    style={[
                      styles.unlockOptionSubtitle,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {isAdLoading
                      ? "Loading ad..."
                      : "Watch a short ad to unlock for free"}
                  </Text>
                </View>
                {isAdLoading ? (
                  <ActivityIndicator size="small" color={theme.textSecondary} />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.textSecondary}
                  />
                )}
              </TouchableOpacity>
            )}

            {/* Wait for free */}
            {daysUntilFree && daysUntilFree > 0 && (
              <View
                style={[
                  styles.unlockOption,
                  { backgroundColor: theme.surface },
                ]}
              >
                <Ionicons name="time" size={24} color="#ffd700" />
                <View style={styles.unlockOptionText}>
                  <Text
                    style={[styles.unlockOptionTitle, { color: theme.text }]}
                  >
                    Wait for Free Access
                  </Text>
                  <Text
                    style={[
                      styles.unlockOptionSubtitle,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Available in {daysUntilFree}{" "}
                    {daysUntilFree === 1 ? "day" : "days"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surface }]}
            onPress={onClose}
            disabled={isUnlocking}
          >
            <Text
              style={[styles.closeButtonText, { color: theme.textSecondary }]}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
    position: "relative",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  unlockOptions: { marginBottom: 16, gap: 12 },
  unlockOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  unlockOptionDisabled: {
    opacity: 0.5,
  },
  unlockOptionText: { flex: 1 },
  unlockOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  unlockOptionSubtitle: {
    fontSize: 13,
  },
  closeButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
