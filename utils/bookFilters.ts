import { BookItem } from "../utils/books";

export type BookSortKey =
  | "newest"
  | "oldest"
  | "title"
  | "views"
  | "likes"
  | "comments";

export interface BookFilters {
  query: string;
  genre: string | null;
  sort: BookSortKey;
}

export const SORT_OPTIONS: { key: BookSortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "title", label: "Title A–Z" },
  { key: "views", label: "Most Views" },
  { key: "likes", label: "Most Likes" },
  { key: "comments", label: "Most Comments" },
];

export function getAllGenres(books: BookItem[]): string[] {
  const genres = new Set<string>();
  for (const book of books) {
    for (const g of book.genre) {
      genres.add(g.trim());
    }
  }
  return Array.from(genres).sort((a, b) => a.localeCompare(b));
}

export function getPopularBooks(books: BookItem[], limit = 8): BookItem[] {
  return [...books].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, limit);
}

export function filterAndSortBooks(
  books: BookItem[],
  filters: BookFilters,
  commentCounts: Record<string, number> = {},
): BookItem[] {
  const q = filters.query.trim().toLowerCase();

  let result = books.filter((book) => {
    if (filters.genre && !book.genre.some((g) => g.trim() === filters.genre)) {
      return false;
    }
    if (!q) return true;
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.description.toLowerCase().includes(q) ||
      book.genre.some((g) => g.toLowerCase().includes(q))
    );
  });

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      case "views":
        return b.viewsCount - a.viewsCount;
      case "likes":
        return b.favoritesCount - a.favoritesCount;
      case "comments":
        return (commentCounts[b.id] ?? 0) - (commentCounts[a.id] ?? 0);
      default:
        return 0;
    }
  });

  return result;
}

export function buildBookCommentCounts(
  books: BookItem[],
  chapterCounts: Record<string, number>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const book of books) {
    let total = 0;
    for (const chapter of book.chaptersList ?? []) {
      total += chapterCounts[chapter.id] ?? 0;
    }
    counts[book.id] = total;
  }
  return counts;
}
