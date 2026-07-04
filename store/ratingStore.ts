import { create } from "zustand";
import * as Database from "../utils/database";
import { getAuthUserIdOrNull } from "../utils/authUser";

interface RatingState {
  userRating: number | null;
  averageRating: number;
  ratingCount: number;
  isLoading: boolean;
  loadBookRating: (bookId: string) => Promise<void>;
  rateBook: (bookId: string, rating: number) => Promise<void>;
}

export const useRatingStore = create<RatingState>((set, get) => ({
  userRating: null,
  averageRating: 0,
  ratingCount: 0,
  isLoading: false,

  loadBookRating: async (bookId: string) => {
    try {
      set({ isLoading: true });
      const userId = getAuthUserIdOrNull();
      
      const [userRatingData, avgRating, count] = await Promise.all([
        userId ? Database.getBookRating(bookId, userId) : Promise.resolve(null),
        Database.getBookAverageRating(bookId),
        Database.getBookRatingCount(bookId),
      ]);

      set({
        userRating: userRatingData?.rating || null,
        averageRating: avgRating,
        ratingCount: count,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading book rating:', error);
      set({ isLoading: false });
    }
  },

  rateBook: async (bookId: string, rating: number) => {
    try {
      const userId = getAuthUserIdOrNull();
      if (!userId) return;

      await Database.addOrUpdateBookRating(bookId, userId, rating);
      
      // Reload ratings
      await get().loadBookRating(bookId);
    } catch (error) {
      console.error('Error rating book:', error);
    }
  },
}));
