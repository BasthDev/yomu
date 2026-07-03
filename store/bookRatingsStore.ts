import { create } from "zustand";
import * as Database from "../utils/database";

interface BookRatingsState {
  ratings: Record<string, number>; // book_id -> average rating
  ratingCounts: Record<string, number>; // book_id -> count
  isLoading: boolean;
  loadAllRatings: (bookIds: string[]) => Promise<void>;
  loadBookRating: (bookId: string) => Promise<void>;
  getRating: (bookId: string) => number;
}

export const useBookRatingsStore = create<BookRatingsState>((set, get) => ({
  ratings: {},
  ratingCounts: {},
  isLoading: false,

  loadAllRatings: async (bookIds: string[]) => {
    try {
      set({ isLoading: true });
      const ratings: Record<string, number> = {};
      const counts: Record<string, number> = {};

      await Promise.all(
        bookIds.map(async (bookId) => {
          const [avgRating, count] = await Promise.all([
            Database.getBookAverageRating(bookId),
            Database.getBookRatingCount(bookId),
          ]);
          ratings[bookId] = avgRating;
          counts[bookId] = count;
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
}));
