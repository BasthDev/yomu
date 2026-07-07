import { getAuthUserIdOrNull } from "./authUser";
import { BookItem, ChapterItem } from "./books";
import * as Database from "./database";
export const CHAPTER_COST = 15;
export const WAIT_DAYS = 3;
export const FREE_CHAPTER_COUNT = 3;

export interface ChapterAccessResult {
  canAccess: boolean;
  reason?:
    | "free"
    | "unlocked"
    | "wait_available"
    | "coins_needed"
    | "wait_required";
  daysUntilFree?: number;
  coinsNeeded?: number;
}

export type ChapterDisplayStatus =
  | "free"
  | "unlocked"
  | "locked"
  | "wait_available";

function getDaysSinceRelease(releasedAt: string): number {
  const releaseDate = new Date(releasedAt);
  const now = new Date();
  const diffMs = now.getTime() - releaseDate.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Single source of truth for lock badges AND navigation access.
 * Uses the zustand purchasedChapterIds map (hydrated from SQLite).
 * Uses database-stored release dates for accurate time-based unlocking.
 */
export async function resolveChapterAccess(
  book: BookItem,
  chapter: ChapterItem,
  purchasedChapterIds: Record<string, true>,
): Promise<ChapterAccessResult> {
  if (book.isFree || !chapter.isLocked) {
    return { canAccess: true, reason: "free" };
  }

  if (purchasedChapterIds[chapter.id]) {
    return { canAccess: true, reason: "unlocked" };
  }

  // Check database for stored release date, fall back to chapter data
  const dbReleaseDate = await Database.getChapterReleaseDate(chapter.id);
  const releaseDateToUse = dbReleaseDate || chapter.releasedAt;

  const daysSinceRelease = getDaysSinceRelease(releaseDateToUse);
  if (daysSinceRelease >= WAIT_DAYS) {
    return { canAccess: true, reason: "wait_available" };
  }

  const daysUntilFree = WAIT_DAYS - daysSinceRelease;
  return {
    canAccess: false,
    reason: "wait_required",
    daysUntilFree: Math.ceil(daysUntilFree),
    coinsNeeded: CHAPTER_COST,
  };
}

/** @deprecated Use resolveChapterAccess with purchasedChapterIds from store */
export async function checkChapterAccess(
  book: BookItem,
  chapter: ChapterItem,
  purchasedChapterIds?: Record<string, true>,
): Promise<ChapterAccessResult> {
  if (purchasedChapterIds) {
    return resolveChapterAccess(book, chapter, purchasedChapterIds);
  }

  const userId = getAuthUserIdOrNull();
  if (!userId) {
    return resolveChapterAccess(book, chapter, {});
  }

  const isPurchased = await Database.isChapterUnlocked(userId, chapter.id);
  const ids = isPurchased ? { [chapter.id]: true as const } : {};
  return resolveChapterAccess(book, chapter, ids);
}

export function getTimeUntilFree(releasedAt: string): string {
  const daysSinceRelease = getDaysSinceRelease(releasedAt);
  const daysUntilFree = Math.ceil(WAIT_DAYS - daysSinceRelease);

  if (daysUntilFree <= 0) return "Available now";
  if (daysUntilFree === 1) return "1 day";
  return `${daysUntilFree} days`;
}

export function isChapterLockedInData(
  book: BookItem,
  chapter: ChapterItem,
): boolean {
  if (book.isFree) return false;
  return chapter.isLocked === true;
}

export async function getChapterDisplayStatus(
  book: BookItem,
  chapter: ChapterItem,
  purchasedChapterIds: Record<string, true>,
): Promise<ChapterDisplayStatus> {
  const access = await resolveChapterAccess(book, chapter, purchasedChapterIds);

  if (access.reason === "free") return "free";
  if (access.reason === "unlocked") return "unlocked";
  if (access.reason === "wait_available") return "wait_available";
  return "locked";
}

/** @deprecated Use getChapterDisplayStatus (async version) */
export function getChapterDisplayStatusSync(
  book: BookItem,
  chapter: ChapterItem,
  purchasedChapterIds: Record<string, true>,
): ChapterDisplayStatus {
  // Fallback sync version for components that haven't been updated yet
  // This uses chapter.releasedAt without database check
  if (book.isFree || !chapter.isLocked) {
    return "free";
  }

  if (purchasedChapterIds[chapter.id]) {
    return "unlocked";
  }

  const daysSinceRelease = getDaysSinceRelease(chapter.releasedAt);
  if (daysSinceRelease >= WAIT_DAYS) {
    return "wait_available";
  }

  return "locked";
}
