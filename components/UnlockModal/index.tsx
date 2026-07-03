import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Chapter Locked
          </Text>
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            You need to unlock this chapter to read it.
          </Text>

          <View style={styles.unlockOptions}>
            <TouchableOpacity
              style={[styles.unlockOption, { backgroundColor: theme.surface }]}
              onPress={onUnlock}
              disabled={isUnlocking || balance < chapterCost}
            >
              <Ionicons name="wallet" size={24} color={theme.primary} />
              <View style={styles.unlockOptionText}>
                <Text style={[styles.unlockOptionTitle, { color: theme.text }]}>
                  Unlock with Coins
                </Text>
                <Text
                  style={[
                    styles.unlockOptionSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  {balance >= chapterCost
                    ? `${chapterCost} coins (You have ${balance})`
                    : `Need ${chapterCost} coins (You have ${balance})`}
                </Text>
              </View>
            </TouchableOpacity>

            {onUnlockWithAd && (
              <TouchableOpacity
                style={[
                  styles.unlockOption,
                  { backgroundColor: theme.surface },
                ]}
                onPress={onUnlockWithAd}
                disabled={isAdLoading || isUnlocking}
              >
                <Ionicons name="play-circle" size={24} color="#ff6b6b" />
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
                      : "Watch ad to unlock for free"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  unlockOptions: { marginBottom: 16 },
  unlockOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  unlockOptionText: { flex: 1 },
  unlockOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 12,
  },
  unlockOptionSubtitle: {
    fontSize: 14,
    marginLeft: 12,
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
