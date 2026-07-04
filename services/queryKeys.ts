export const queryKeys = {
  books: {
    all: ["books"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["books", "list", filters] as const,
    detail: (id: string) => ["books", "detail", id] as const,
    commentCounts: ["books", "commentCounts"] as const,
  },
  comments: {
    chapter: (chapterId: string) => ["comments", chapterId] as const,
  },
  ratings: {
    all: (bookIds: string[]) => ["ratings", bookIds] as const,
    book: (bookId: string) => ["ratings", bookId] as const,
  },
};
