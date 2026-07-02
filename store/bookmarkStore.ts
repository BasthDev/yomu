import { create } from "zustand";
import * as Database from "../utils/database";

interface ReadingHistoryItem {
  bookId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  lastReadAt: string;
}

interface BookmarkState {
  bookmarkedIds: string[];
  readingHistory: ReadingHistoryItem[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  addBookmark: (id: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  clearBookmarks: () => Promise<void>;
  updateReadingHistory: (
    bookId: string,
    chapterId: string,
    chapterNumber: number,
    chapterTitle: string,
  ) => Promise<void>;
  getReadingHistory: () => ReadingHistoryItem[];
  getLastReadChapter: (bookId: string) => ReadingHistoryItem | undefined;
  clearReadingHistory: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkedIds: [],
  readingHistory: [],
  isLoading: true,

  loadData: async () => {
    try {
      const [bookmarks, history] = await Promise.all([
        Database.getAllBookmarks(),
        Database.getReadingHistory(),
      ]);

      const historyItems: ReadingHistoryItem[] = history.map((h) => ({
        bookId: h.book_id,
        chapterId: h.chapter_id,
        chapterNumber: h.chapter_number,
        chapterTitle: h.chapter_title,
        lastReadAt: h.last_read_at,
      }));

      set({
        bookmarkedIds: bookmarks,
        readingHistory: historyItems,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading data from database:", error);
      set({ isLoading: false });
    }
  },

  addBookmark: async (id) => {
    await Database.addBookmark(id);
    set((state) => ({
      bookmarkedIds: [...state.bookmarkedIds, id],
    }));
  },

  removeBookmark: async (id) => {
    await Database.removeBookmark(id);
    set((state) => ({
      bookmarkedIds: state.bookmarkedIds.filter(
        (bookmarkId) => bookmarkId !== id,
      ),
    }));
  },

  isBookmarked: (id) => {
    return get().bookmarkedIds.includes(id);
  },

  clearBookmarks: async () => {
    await Database.clearBookmarks();
    set({ bookmarkedIds: [] });
  },

  updateReadingHistory: async (
    bookId,
    chapterId,
    chapterNumber,
    chapterTitle,
  ) => {
    await Database.updateReadingHistory(
      bookId,
      chapterId,
      chapterNumber,
      chapterTitle,
    );

    set((state) => {
      const existingIndex = state.readingHistory.findIndex(
        (item) => item.bookId === bookId,
      );
      const newHistoryItem: ReadingHistoryItem = {
        bookId,
        chapterId,
        chapterNumber,
        chapterTitle,
        lastReadAt: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        // Update existing entry
        const updatedHistory = [...state.readingHistory];
        updatedHistory[existingIndex] = newHistoryItem;
        // Move to top (most recent)
        updatedHistory.splice(existingIndex, 1);
        updatedHistory.unshift(newHistoryItem);
        return { readingHistory: updatedHistory };
      } else {
        // Add new entry at the top
        return {
          readingHistory: [newHistoryItem, ...state.readingHistory],
        };
      }
    });
  },

  getReadingHistory: () => {
    return get().readingHistory;
  },

  getLastReadChapter: (bookId) => {
    return get().readingHistory.find((item) => item.bookId === bookId);
  },

  clearReadingHistory: async () => {
    await Database.clearReadingHistory();
    set({ readingHistory: [] });
  },
}));
