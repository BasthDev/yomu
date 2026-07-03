import { create } from "zustand";
import * as Database from "../utils/database";
import { useAuthStore } from "./authStore";

interface BookRatingsState {
  ratings: Record<string, number>; // book_id -> average rating
  ratingCounts: Record<string, number>; // book_id -> count
  userRatings: Record<string, number>; // book_id -> user's rating
  isLoading: boolean;
  loadAllRatings: (bookIds: string[]) => Promise<void>;
  loadBookRating: (bookId: string) => Promise<void>;
  getRating: (bookId: string) => number;
  getUserRating: (bookId: string) => number | null;
  rateBook: (bookId: string, rating: number) => Promise<void>;
}

export const useBookRatingsStore = create<BookRatingsState>((set, get) => ({
  ratings: {},
  ratingCounts: {},
  userRatings: {},
  isLoading: false,

  loadAllRatings: async (bookIds: string[]) => {
    try {
      set({ isLoading: true });
      const ratings: Record<string, number> = {};
      const counts: Record<string, number> = {};
      const userId = useAuthStore.getState().userId;

      await Promise.all(
        bookIds.map(async (bookId) => {
          const [avgRating, count] = await Promise.all([
            Database.getBookAverageRating(bookId),
            Database.getBookRatingCount(bookId),
          ]);
          ratings[bookId] = avgRating;
          counts[bookId] = count;

          // Also load user rating if logged in
          if (userId) {
            const userRatingData = await Database.getBookRating(bookId, userId);
            if (userRatingData) {
              set((state) => ({
                userRatings: {
                  ...state.userRatings,
                  [bookId]: userRatingData.rating,
                },
              }));
            }
          }
        }),
      );

      set({ ratings, ratingCounts: counts, isLoading: false });
    } catch (error) {
      console.error("Error loading all ratings:", error);
      set({ isLoading: false });
    }
  },

  loadBookRating: async (bookId: string) => {
    try {
      const [avgRating, count] = await Promise.all([
        Database.getBookAverageRating(bookId),
        Database.getBookRatingCount(bookId),
      ]);

      set({
        ratings: { ...get().ratings, [bookId]: avgRating },
        ratingCounts: { ...get().ratingCounts, [bookId]: count },
      });
    } catch (error) {
      console.error("Error loading book rating:", error);
    }
  },

  getRating: (bookId: string) => {
    return get().ratings[bookId] ?? 0;
  },

  getUserRating: (bookId: string) => {
    return get().userRatings[bookId] ?? null;
  },

  rateBook: async (bookId: string, rating: number) => {
    try {
      const userId = useAuthStore.getState().userId;
      if (!userId) return;

      await Database.addOrUpdateBookRating(bookId, userId, rating);

      // Update user rating
      set({
        userRatings: { ...get().userRatings, [bookId]: rating },
      });

      // Reload this book's rating to get updated average
      await get().loadBookRating(bookId);
    } catch (error) {
      console.error("Error rating book:", error);
    }
  },
}));
