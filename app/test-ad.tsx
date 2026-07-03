import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useCoinStore } from '@/store/coinStore';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TestAdScreen() {
  const { currentTheme } = useThemeStore();
  const { balance } = useCoinStore();
  const { isLoaded, isLoading, isEarned, error, showAd, loadAd } = useRewardedAd();

  const handleWatchAd = async () => {
    if (isLoaded) {
      const success = showAd();
      if (!success) {
        Alert.alert('Error', 'Failed to show ad');
      }
    } else {
      Alert.alert('Ad Not Ready', 'Loading ad, please wait...');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Rewarded Ad Test
        </Text>

        <View style={[styles.balanceCard, { backgroundColor: currentTheme.surface }]}>
          <Ionicons name="cash" size={32} color={currentTheme.primary} />
          <Text style={[styles.balance, { color: currentTheme.text }]}>
            {balance}
          </Text>
          <Text style={[styles.balanceLabel, { color: currentTheme.textSecondary }]}>
            Coins
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: isLoaded ? '#4CAF50' : '#FF9800' }]} />
            <Text style={[styles.statusText, { color: currentTheme.text }]}>
              Ad Loaded: {isLoaded ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: isLoading ? '#2196F3' : '#9E9E9E' }]} />
            <Text style={[styles.statusText, { color: currentTheme.text }]}>
              Loading: {isLoading ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: isEarned ? '#4CAF50' : '#9E9E9E' }]} />
            <Text style={[styles.statusText, { color: currentTheme.text }]}>
              Reward Earned: {isEarned ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="warning" size={20} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.watchButton,
            {
              backgroundColor: isLoaded ? currentTheme.primary : '#9E9E9E',
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleWatchAd}
          disabled={!isLoaded || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="play-circle" size={24} color="#fff" />
              <Text style={styles.watchButtonText}>Watch Ad (+15 Coins)</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.reloadButton, { borderColor: currentTheme.border }]}
          onPress={loadAd}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={20} color={currentTheme.textSecondary} />
          <Text style={[styles.reloadButtonText, { color: currentTheme.textSecondary }]}>
            Reload Ad
          </Text>
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: currentTheme.surface }]}>
          <Text style={[styles.infoTitle, { color: currentTheme.text }]}>
            Test Information
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textSecondary }]}>
            • Development mode uses test ads
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textSecondary }]}>
            • Watching the full ad earns 15 coins
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textSecondary }]}>
            • Coins are added automatically after ad completion
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    gap: 12,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  balanceLabel: {
    fontSize: 14,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
    gap: 8,
  },
  reloadButtonText: {
    fontSize: 14,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
