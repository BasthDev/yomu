import { create } from "zustand";
import { AD_REWARDS } from "../utils/adConfig";
import { getAuthUserId, getAuthUserIdOrNull } from "../utils/authUser";
import * as Database from "../utils/database";
import { useChapterUnlockStore } from "./chapterUnlockStore";

interface CoinState {
  balance: number;
  isLoading: boolean;
  loadBalance: () => Promise<void>;
  addCoins: (amount: number, description: string) => Promise<void>;
  spendCoins: (amount: number, description: string) => Promise<boolean>;
  canSpendCoins: (amount: number) => boolean;
  getTransactions: () => Promise<Database.CoinTransaction[]>;
  watchRewardAd: () => Promise<boolean>;
  watchInterstitialAd: () => Promise<boolean>;
  unlockChapter: (
    bookId: string,
    chapterId: string,
    authorId: string,
  ) => Promise<boolean>;
  unlockChapterWithAd: (
    bookId: string,
    chapterId: string,
  ) => Promise<boolean>;
  isChapterUnlocked: (chapterId: string) => Promise<boolean>;
}

export const useCoinStore = create<CoinState>((set, get) => ({
  balance: 0,
  isLoading: true,

  loadBalance: async () => {
    const userId = getAuthUserIdOrNull();
    if (!userId) {
      set({ balance: 0, isLoading: false });
      return;
    }

    try {
      await Database.getOrCreateUser(userId);
      const balance = await Database.getUserBalance(userId);
      set({ balance, isLoading: false });
    } catch (error) {
      console.error("Error loading balance:", error);
      set({ isLoading: false });
    }
  },

  addCoins: async (amount: number, description: string) => {
    const userId = getAuthUserId();

    try {
      await Database.updateUserCoins(userId, amount);
      await Database.addCoinTransaction(userId, amount, "earned", description);
      const newBalance = await Database.getUserBalance(userId);
      set({ balance: newBalance });
    } catch (error) {
      console.error("Error adding coins:", error);
    }
  },

  spendCoins: async (amount: number, description: string) => {
    const userId = getAuthUserId();

    try {
      const currentBalance = get().balance;
      if (currentBalance < amount) return false;

      await Database.updateUserCoins(userId, -amount);
      await Database.addCoinTransaction(userId, -amount, "spent", description);
      const newBalance = await Database.getUserBalance(userId);
      set({ balance: newBalance });
      return true;
    } catch (error) {
      console.error("Error spending coins:", error);
      return false;
    }
  },

  canSpendCoins: (amount: number) => {
    return get().balance >= amount;
  },

  getTransactions: async () => {
    const userId = getAuthUserIdOrNull();
    if (!userId) return [];

    try {
      return await Database.getCoinTransactions(userId);
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  },

  watchRewardAd: async () => {
    const userId = getAuthUserId();

    try {
      const coinsEarned = AD_REWARDS.REWARDED_COINS;
      await Database.recordAdWatch(userId, "reward", coinsEarned);
      await get().addCoins(coinsEarned, "Watched reward ad");
      return true;
    } catch (error) {
      console.error("Error watching ad:", error);
      return false;
    }
  },

  watchInterstitialAd: async () => {
    const userId = getAuthUserId();

    try {
      const coinsEarned = AD_REWARDS.INTERSTITIAL_COINS;
      await Database.recordAdWatch(
        userId,
        "rewarded_interstitial",
        coinsEarned,
      );
      await get().addCoins(coinsEarned, "Watched rewarded interstitial ad");
      return true;
    } catch (error) {
      console.error("Error watching interstitial ad:", error);
      return false;
    }
  },

  unlockChapter: async (
    bookId: string,
    chapterId: string,
    authorId: string,
  ) => {
    const userId = getAuthUserId();

    try {
      const alreadyUnlocked = await Database.isChapterUnlocked(
        userId,
        chapterId,
      );
      if (alreadyUnlocked) return true;

      const cost = 15;
      const success = await get().spendCoins(
        cost,
        `Unlocked chapter ${chapterId}`,
      );
      if (success) {
        await Database.unlockChapter(userId, bookId, chapterId, "coins", cost);
        await Database.addCoinsToAuthor(authorId, cost);
        await Database.addCoinTransaction(
          authorId,
          cost,
          "received",
          `Chapter unlock from user ${userId}`,
        );
        useChapterUnlockStore.getState().markPurchased(chapterId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error unlocking chapter:", error);
      return false;
    }
  },

  unlockChapterWithAd: async (bookId: string, chapterId: string) => {
    const userId = getAuthUserId();

    try {
      const alreadyUnlocked = await Database.isChapterUnlocked(
        userId,
        chapterId,
      );
      if (alreadyUnlocked) return true;

      await Database.unlockChapter(userId, bookId, chapterId, "ad", 0);
      await Database.recordAdWatch(userId, "chapter_unlock", 0);
      useChapterUnlockStore.getState().markPurchased(chapterId);
      return true;
    } catch (error) {
      console.error("Error unlocking chapter with ad:", error);
      return false;
    }
  },

  isChapterUnlocked: async (chapterId: string) => {
    const userId = getAuthUserIdOrNull();
    if (!userId) return false;

    try {
      return await Database.isChapterUnlocked(userId, chapterId);
    } catch (error) {
      console.error("Error checking chapter unlock:", error);
      return false;
    }
  },
}));
