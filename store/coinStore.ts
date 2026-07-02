import { create } from 'zustand';
import * as Database from '../utils/database';
import { useChapterUnlockStore } from './chapterUnlockStore';

const USER_ID = 'user_1'; // In production, this would come from auth

interface CoinState {
  balance: number;
  isLoading: boolean;
  loadBalance: () => Promise<void>;
  addCoins: (amount: number, description: string) => Promise<void>;
  spendCoins: (amount: number, description: string) => Promise<boolean>;
  canSpendCoins: (amount: number) => boolean;
  getTransactions: () => Promise<Database.CoinTransaction[]>;
  watchRewardAd: () => Promise<boolean>;
  unlockChapter: (
    bookId: string,
    chapterId: string,
    authorId: string,
  ) => Promise<boolean>;
  isChapterUnlocked: (chapterId: string) => Promise<boolean>;
}

export const useCoinStore = create<CoinState>((set, get) => ({
  balance: 0,
  isLoading: true,

  loadBalance: async () => {
    try {
      await Database.getOrCreateUser(USER_ID);
      const balance = await Database.getUserBalance(USER_ID);
      set({ balance, isLoading: false });
    } catch (error) {
      console.error('Error loading balance:', error);
      set({ isLoading: false });
    }
  },

  addCoins: async (amount: number, description: string) => {
    try {
      await Database.updateUserCoins(USER_ID, amount);
      await Database.addCoinTransaction(USER_ID, amount, 'earned', description);
      const newBalance = await Database.getUserBalance(USER_ID);
      set({ balance: newBalance });
    } catch (error) {
      console.error('Error adding coins:', error);
    }
  },

  spendCoins: async (amount: number, description: string) => {
    try {
      const currentBalance = get().balance;
      if (currentBalance < amount) return false;

      await Database.updateUserCoins(USER_ID, -amount);
      await Database.addCoinTransaction(USER_ID, -amount, 'spent', description);
      const newBalance = await Database.getUserBalance(USER_ID);
      set({ balance: newBalance });
      return true;
    } catch (error) {
      console.error('Error spending coins:', error);
      return false;
    }
  },

  canSpendCoins: (amount: number) => {
    return get().balance >= amount;
  },

  getTransactions: async () => {
    try {
      return await Database.getCoinTransactions(USER_ID);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  watchRewardAd: async () => {
    try {
      // User taps manually on wallet screen; no cooldown — each tap earns coins
      const coinsEarned = 10;
      await Database.recordAdWatch(USER_ID, 'reward', coinsEarned);
      await get().addCoins(coinsEarned, 'Watched reward ad');
      return true;
    } catch (error) {
      console.error('Error watching ad:', error);
      return false;
    }
  },

  unlockChapter: async (bookId: string, chapterId: string, authorId: string) => {
    try {
      const alreadyUnlocked = await Database.isChapterUnlocked(USER_ID, chapterId);
      if (alreadyUnlocked) return true;

      const cost = 15;
      const success = await get().spendCoins(cost, `Unlocked chapter ${chapterId}`);
      if (success) {
        await Database.unlockChapter(USER_ID, bookId, chapterId, 'coins', cost);
        await Database.addCoinsToAuthor(authorId, cost);
        await Database.addCoinTransaction(
          authorId,
          cost,
          'received',
          `Chapter unlock from user ${USER_ID}`,
        );
        useChapterUnlockStore.getState().markPurchased(chapterId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      return false;
    }
  },

  isChapterUnlocked: async (chapterId: string) => {
    try {
      return await Database.isChapterUnlocked(USER_ID, chapterId);
    } catch (error) {
      console.error('Error checking chapter unlock:', error);
      return false;
    }
  },
}));
