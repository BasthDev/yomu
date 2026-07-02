import { create } from "zustand";
import * as Database from "../utils/database";

const USER_ID = "user_1";

interface ChapterUnlockState {
  purchasedChapterIds: Record<string, true>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  markPurchased: (chapterId: string) => void;
  isPurchased: (chapterId: string) => boolean;
}

export const useChapterUnlockStore = create<ChapterUnlockState>((set, get) => ({
  purchasedChapterIds: {},
  // Never block screens — hydrate updates purchases in the background
  isHydrated: true,

  hydrate: async () => {
    try {
      const ids = await Database.getPurchasedChapterIds(USER_ID);
      const purchasedChapterIds: Record<string, true> = {};
      for (const id of ids) {
        purchasedChapterIds[id] = true;
      }
      set({ purchasedChapterIds, isHydrated: true });
    } catch (error) {
      console.error("Error hydrating chapter unlocks:", error);
      set({ isHydrated: true });
    }
  },

  markPurchased: (chapterId: string) => {
    set((state) => ({
      purchasedChapterIds: {
        ...state.purchasedChapterIds,
        [chapterId]: true,
      },
    }));
  },

  isPurchased: (chapterId: string) => {
    return !!get().purchasedChapterIds[chapterId];
  },
}));
