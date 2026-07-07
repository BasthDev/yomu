import { useChapterUnlockStore } from "@/store/chapterUnlockStore";
import { useCoinStore } from "@/store/coinStore";
import { BookItem, ChapterItem } from "@/utils/books";
import {
    CHAPTER_COST,
    ChapterAccessResult,
    ChapterDisplayStatus,
    getChapterDisplayStatusSync,
    getTimeUntilFree,
    resolveChapterAccess,
} from "@/utils/chapterAccess";
import { DUMMY_BOOKS } from "@/utils/dummyData";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
} from "react";

interface BookChapterMatch {
  book: BookItem;
  chapter: ChapterItem;
  chapterIndex: number;
}

interface SecurityContextValue {
  isReady: boolean;
  chapterCost: number;
  checkAccess: (
    book: BookItem,
    chapter: ChapterItem,
  ) => Promise<ChapterAccessResult>;
  unlockWithCoins: (book: BookItem, chapter: ChapterItem) => Promise<boolean>;
  unlockWithAd: (book: BookItem, chapter: ChapterItem) => Promise<boolean>;
  isChapterUnlockedInDb: (chapterId: string) => Promise<boolean>;
  isChapterAccessible: (
    book: BookItem,
    chapter: ChapterItem,
  ) => Promise<boolean>;
  getChapterDisplayStatus: (
    book: BookItem,
    chapter: ChapterItem,
  ) => ChapterDisplayStatus;
  getTimeUntilFree: (releasedAt: string) => string;
  findBookAndChapter: (chapterId: string) => BookChapterMatch | null;
  refreshUnlocks: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextValue | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { unlockChapter, unlockChapterWithAd, isChapterUnlocked } =
    useCoinStore();
  const isReady = useChapterUnlockStore((state) => state.isHydrated);
  const purchasedChapterIds = useChapterUnlockStore(
    (state) => state.purchasedChapterIds,
  );
  const hydrate = useChapterUnlockStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const refreshUnlocks = useCallback(async () => {
    await hydrate();
  }, [hydrate]);

  const checkAccess = useCallback(
    async (
      book: BookItem,
      chapter: ChapterItem,
    ): Promise<ChapterAccessResult> => {
      return await resolveChapterAccess(book, chapter, purchasedChapterIds);
    },
    [purchasedChapterIds],
  );

  const isChapterAccessible = useCallback(
    async (book: BookItem, chapter: ChapterItem) => {
      const access = await checkAccess(book, chapter);
      return access.canAccess;
    },
    [checkAccess],
  );

  const unlockWithCoins = useCallback(
    async (book: BookItem, chapter: ChapterItem) => {
      return unlockChapter(book.id, chapter.id, book.authorId);
    },
    [unlockChapter],
  );

  const unlockWithAd = useCallback(
    async (book: BookItem, chapter: ChapterItem) => {
      return unlockChapterWithAd(book.id, chapter.id);
    },
    [unlockChapterWithAd],
  );

  const getChapterDisplayStatus = useCallback(
    (book: BookItem, chapter: ChapterItem): ChapterDisplayStatus => {
      return getChapterDisplayStatusSync(book, chapter, purchasedChapterIds);
    },
    [purchasedChapterIds],
  );

  const findBookAndChapter = useCallback(
    (chapterId: string): BookChapterMatch | null => {
      for (const book of DUMMY_BOOKS) {
        const chapterIndex =
          book.chaptersList?.findIndex((ch) => ch.id === chapterId) ?? -1;
        if (chapterIndex !== -1 && book.chaptersList) {
          return {
            book,
            chapter: book.chaptersList[chapterIndex],
            chapterIndex,
          };
        }
      }
      return null;
    },
    [],
  );

  const value = useMemo<SecurityContextValue>(
    () => ({
      isReady,
      chapterCost: CHAPTER_COST,
      checkAccess,
      unlockWithCoins,
      unlockWithAd,
      isChapterUnlockedInDb: isChapterUnlocked,
      isChapterAccessible,
      getChapterDisplayStatus,
      getTimeUntilFree,
      findBookAndChapter,
      refreshUnlocks,
    }),
    [
      isReady,
      checkAccess,
      unlockWithCoins,
      unlockWithAd,
      isChapterUnlocked,
      isChapterAccessible,
      getChapterDisplayStatus,
      findBookAndChapter,
      refreshUnlocks,
    ],
  );

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within SecurityProvider");
  }
  return context;
}
