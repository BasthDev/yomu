import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useGlobalRewardedAd } from "../../context/AdContext";
import { useCoinStore } from "../../store/coinStore";
import { useThemeStore } from "../../store/themeStore";

export default function Wallet() {
  const router = useRouter();
  const { balance, loadBalance, getTransactions } = useCoinStore();
  const { currentTheme } = useThemeStore();
  const watchRewardAd = useCoinStore((state) => state.watchRewardAd);
  const { isRewardedLoaded, isRewardedLoading, showRewardedAd } =
    useGlobalRewardedAd();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadBalance();
    const txs = await getTransactions();
    setTransactions(txs);
    setIsLoadingData(false);
  };

  const handleWatchAd = async () => {
    if (isRewardedLoaded) {
      const { earned } = await showRewardedAd();
      if (earned) {
        await watchRewardAd();
        await loadBalance();
        const txs = await getTransactions();
        setTransactions(txs);
      }
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "earned":
        return "Earned";
      case "spent":
        return "Spent";
      case "received":
        return "Received";
      default:
        return type;
    }
  };

  const formatAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : `${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingData) {
    return (
      <Container>
        <CustomHeader title="Wallet" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <CustomHeader title="Wallet" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ContentWithPadding style={styles.content}>
          {/* Balance Card */}
          <View
            style={[
              styles.balanceCard,
              { backgroundColor: currentTheme.primary },
            ]}
          >
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceUnit}>Coins</Text>
          </View>

          {/* Earn Coins Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Earn Coins
            </Text>
            <Pressable
              style={[
                styles.watchAdButton,
                { backgroundColor: currentTheme.surface },
              ]}
              onPress={handleWatchAd}
              disabled={!isRewardedLoaded || isRewardedLoading}
            >
              {isRewardedLoading ? (
                <ActivityIndicator color={currentTheme.primary} />
              ) : (
                <>
                  <Ionicons
                    name="play-circle"
                    size={24}
                    color={currentTheme.primary}
                  />
                  <View style={styles.adTextContainer}>
                    <Text
                      style={[styles.adTitle, { color: currentTheme.text }]}
                    >
                      Watch Reward Ad
                    </Text>
                    <Text
                      style={[
                        styles.adSubtitle,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Earn 15 coins
                    </Text>
                  </View>
                </>
              )}
            </Pressable>
          </View>

          {/* Transaction History (Hidden for now) */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Transaction History
            </Text>
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>Transactions hidden</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 4,
  },
  balanceUnit: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  watchAdButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  adSubtitle: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  transactionList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
});
