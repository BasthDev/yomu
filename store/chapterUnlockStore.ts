import { create } from "zustand";
import { getAuthUserIdOrNull } from "../utils/authUser";
import * as Database from "../utils/database";

interface ChapterUnlockState {
  purchasedChapterIds: Record<string, true>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  markPurchased: (chapterId: string) => void;
  isPurchased: (chapterId: string) => boolean;
  reset: () => void;
}

export const useChapterUnlockStore = create<ChapterUnlockState>((set, get) => ({
  purchasedChapterIds: {},
  isHydrated: true,

  hydrate: async () => {
    const userId = getAuthUserIdOrNull();
    if (!userId) {
      set({ purchasedChapterIds: {}, isHydrated: true });
      return;
    }

    try {
      const ids = await Database.getPurchasedChapterIds(userId);
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

  reset: () => {
    set({ purchasedChapterIds: {}, isHydrated: true });
  },
}));
