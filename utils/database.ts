import * as SQLite from "expo-sqlite";

const DB_NAME = "yomu.db";

export interface Bookmark {
  id: string;
  created_at: string;
}

export interface ReadingHistory {
  id: number;
  book_id: string;
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  last_read_at: string;
}

export interface User {
  id: string;
  coin_balance: number;
  created_at: string;
}

export interface AuthorWallet {
  author_id: string;
  coin_balance: number;
  total_earned: number;
}

export interface ChapterUnlock {
  id: number;
  user_id: string;
  book_id: string;
  chapter_id: string;
  unlock_method: string; // 'coins' or 'wait'
  coins_spent: number;
  unlocked_at: string;
}

export interface Comment {
  id: number;
  chapter_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  parent_comment_id: number | null;
  replies?: Comment[];
}

export interface BookRating {
  id: number;
  book_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface CoinTransaction {
  id: number;
  user_id: string;
  amount: number;
  type: string; // 'earned', 'spent', 'received'
  description: string;
  created_at: string;
}

export interface AdWatch {
  id: number;
  user_id: string;
  ad_type: string;
  coins_earned: number;
  watched_at: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Create tables
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS reading_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      chapter_title TEXT NOT NULL,
      last_read_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      coin_balance INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS author_wallets (
      author_id TEXT PRIMARY KEY,
      coin_balance INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS chapter_unlocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      unlock_method TEXT NOT NULL,
      coins_spent INTEGER DEFAULT 0,
      unlocked_at TEXT NOT NULL,
      UNIQUE(user_id, chapter_id)
    );
    
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      parent_comment_id INTEGER,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(comment_id, user_id),
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS book_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      created_at TEXT NOT NULL,
      UNIQUE(book_id, user_id)
    );
    
    CREATE TABLE IF NOT EXISTS coin_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS ad_watches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ad_type TEXT NOT NULL,
      coins_earned INTEGER NOT NULL,
      watched_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_reading_history_book_id ON reading_history(book_id);
    CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_user ON chapter_unlocks(user_id);
    CREATE INDEX IF NOT EXISTS idx_chapter_unlocks_chapter ON chapter_unlocks(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_comments_chapter ON comments(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_ad_watches_user ON ad_watches(user_id);
  `);

  // Add parent_comment_id column if it doesn't exist (for existing databases)
  try {
    const columns = await db.getAllAsync<any>("PRAGMA table_info(comments)");
    const hasParentCommentId = columns.some(
      (col: any) => col.name === "parent_comment_id",
    );
    if (!hasParentCommentId) {
      await db.execAsync(
        "ALTER TABLE comments ADD COLUMN parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE",
      );
    }
  } catch (error) {
    // Ignore migration errors
    console.log("Migration check failed:", error);
  }

  // Add comment_likes table migration
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(comment_id, user_id),
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.log("Comment likes table migration failed:", error);
  }

  return db;
};

// Bookmark operations
export const addBookmark = async (bookId: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO bookmarks (id, created_at) VALUES (?, ?)",
    [bookId, new Date().toISOString()],
  );
};

export const removeBookmark = async (bookId: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM bookmarks WHERE id = ?", [bookId]);
};

export const isBookmarked = async (bookId: string): Promise<boolean> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM bookmarks WHERE id = ?",
    [bookId],
  );
  return (result?.count ?? 0) > 0;
};

export const getAllBookmarks = async (): Promise<string[]> => {
  const database = await getDatabase();
  const bookmarks = await database.getAllAsync<{ id: string }>(
    "SELECT id FROM bookmarks ORDER BY created_at DESC",
  );
  return bookmarks.map((b) => b.id);
};

export const clearBookmarks = async (): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM bookmarks");
};

// Reading history operations
export const updateReadingHistory = async (
  bookId: string,
  chapterId: string,
  chapterNumber: number,
  chapterTitle: string,
): Promise<void> => {
  const database = await getDatabase();

  // Check if entry exists
  const existing = await database.getFirstAsync<{ id: number }>(
    "SELECT id FROM reading_history WHERE book_id = ?",
    [bookId],
  );

  const now = new Date().toISOString();

  if (existing) {
    // Update existing entry
    await database.runAsync(
      "UPDATE reading_history SET chapter_id = ?, chapter_number = ?, chapter_title = ?, last_read_at = ? WHERE id = ?",
      [chapterId, chapterNumber, chapterTitle, now, existing.id],
    );
  } else {
    // Insert new entry
    await database.runAsync(
      "INSERT INTO reading_history (book_id, chapter_id, chapter_number, chapter_title, last_read_at) VALUES (?, ?, ?, ?, ?)",
      [bookId, chapterId, chapterNumber, chapterTitle, now],
    );
  }
};

export const getReadingHistory = async (): Promise<ReadingHistory[]> => {
  const database = await getDatabase();
  const history = await database.getAllAsync<ReadingHistory>(
    "SELECT * FROM reading_history ORDER BY last_read_at DESC",
  );
  return history;
};

export const getLastReadChapter = async (
  bookId: string,
): Promise<ReadingHistory | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<ReadingHistory>(
    "SELECT * FROM reading_history WHERE book_id = ? ORDER BY last_read_at DESC LIMIT 1",
    [bookId],
  );
  return result || null;
};

export const clearReadingHistory = async (): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM reading_history");
};

// Settings operations (for theme persistence)
export const getSetting = async (key: string): Promise<string | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [key],
  );
  return result?.value || null;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value],
  );
};

// User operations
export const getOrCreateUser = async (userId: string): Promise<User> => {
  const database = await getDatabase();
  let user = await database.getFirstAsync<User>(
    "SELECT * FROM users WHERE id = ?",
    [userId],
  );

  if (!user) {
    await database.runAsync(
      "INSERT INTO users (id, coin_balance, created_at) VALUES (?, 0, ?)",
      [userId, new Date().toISOString()],
    );
    user = await database.getFirstAsync<User>(
      "SELECT * FROM users WHERE id = ?",
      [userId],
    );
  }

  return user!;
};

export const updateUserCoins = async (
  userId: string,
  amount: number,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE users SET coin_balance = coin_balance + ? WHERE id = ?",
    [amount, userId],
  );
};

export const getUserBalance = async (userId: string): Promise<number> => {
  const database = await getDatabase();
  const user = await database.getFirstAsync<{ coin_balance: number }>(
    "SELECT coin_balance FROM users WHERE id = ?",
    [userId],
  );
  return user?.coin_balance ?? 0;
};

// Author wallet operations
export const getAuthorWallet = async (
  authorId: string,
): Promise<AuthorWallet | null> => {
  const database = await getDatabase();
  const wallet = await database.getFirstAsync<AuthorWallet>(
    "SELECT * FROM author_wallets WHERE author_id = ?",
    [authorId],
  );
  return wallet || null;
};

export const addCoinsToAuthor = async (
  authorId: string,
  amount: number,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO author_wallets (author_id, coin_balance, total_earned) 
     VALUES (?, ?, ?) 
     ON CONFLICT(author_id) DO UPDATE SET 
       coin_balance = coin_balance + ?,
       total_earned = total_earned + ?`,
    [authorId, amount, amount, amount, amount],
  );
};

// Chapter unlock operations
export const unlockChapter = async (
  userId: string,
  bookId: string,
  chapterId: string,
  method: string,
  coinsSpent: number,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR IGNORE INTO chapter_unlocks (user_id, book_id, chapter_id, unlock_method, coins_spent, unlocked_at) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, bookId, chapterId, method, coinsSpent, new Date().toISOString()],
  );
};

export const isChapterUnlocked = async (
  userId: string,
  chapterId: string,
): Promise<boolean> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM chapter_unlocks WHERE user_id = ? AND chapter_id = ?",
    [userId, chapterId],
  );
  return (result?.count ?? 0) > 0;
};

export const getChapterUnlock = async (
  userId: string,
  chapterId: string,
): Promise<ChapterUnlock | null> => {
  const database = await getDatabase();
  const unlock = await database.getFirstAsync<ChapterUnlock>(
    "SELECT * FROM chapter_unlocks WHERE user_id = ? AND chapter_id = ?",
    [userId, chapterId],
  );
  return unlock || null;
};

export const getPurchasedChapterIds = async (
  userId: string,
): Promise<string[]> => {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ chapter_id: string }>(
    "SELECT chapter_id FROM chapter_unlocks WHERE user_id = ?",
    [userId],
  );
  return rows.map((row) => row.chapter_id);
};

// Comment operations
export const addComment = async (
  chapterId: string,
  userId: string,
  content: string,
  parentCommentId: number | null = null,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT INTO comments (chapter_id, user_id, content, created_at, likes_count, parent_comment_id) VALUES (?, ?, ?, ?, 0, ?)",
    [chapterId, userId, content, new Date().toISOString(), parentCommentId],
  );
};

export const getComments = async (chapterId: string): Promise<Comment[]> => {
  const database = await getDatabase();
  const comments = await database.getAllAsync<Comment>(
    "SELECT * FROM comments WHERE chapter_id = ? ORDER BY created_at DESC",
    [chapterId],
  );
  return comments;
};

export const getCommentsWithReplies = async (
  chapterId: string,
): Promise<Comment[]> => {
  const database = await getDatabase();
  const comments = await database.getAllAsync<Comment>(
    "SELECT * FROM comments WHERE chapter_id = ? AND parent_comment_id IS NULL ORDER BY created_at DESC",
    [chapterId],
  );

  // Get replies for each comment
  for (const comment of comments) {
    const replies = await database.getAllAsync<Comment>(
      "SELECT * FROM comments WHERE parent_comment_id = ? ORDER BY created_at ASC",
      [comment.id],
    );
    (comment as any).replies = replies;
  }

  return comments;
};

export const likeComment = async (
  commentId: number,
  userId: string,
): Promise<boolean> => {
  const database = await getDatabase();

  // Check if user already liked this comment
  const existingLike = await database.getFirstAsync<any>(
    "SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?",
    [commentId, userId],
  );

  if (existingLike) {
    // Unlike: remove the like and decrement count
    await database.runAsync(
      "DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?",
      [commentId, userId],
    );
    await database.runAsync(
      "UPDATE comments SET likes_count = likes_count - 1 WHERE id = ?",
      [commentId],
    );
    return false; // Unliked
  } else {
    // Like: add the like and increment count
    await database.runAsync(
      "INSERT INTO comment_likes (comment_id, user_id, created_at) VALUES (?, ?, ?)",
      [commentId, userId, new Date().toISOString()],
    );
    await database.runAsync(
      "UPDATE comments SET likes_count = likes_count + 1 WHERE id = ?",
      [commentId],
    );
    return true; // Liked
  }
};

export const hasUserLikedComment = async (
  commentId: number,
  userId: string,
): Promise<boolean> => {
  const database = await getDatabase();
  const like = await database.getFirstAsync<any>(
    "SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?",
    [commentId, userId],
  );
  return !!like;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM comments WHERE id = ?", [commentId]);
};

// Book rating operations
export const addOrUpdateBookRating = async (
  bookId: string,
  userId: string,
  rating: number,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO book_ratings (book_id, user_id, rating, created_at) VALUES (?, ?, ?, ?)",
    [bookId, userId, rating, new Date().toISOString()],
  );
};

export const getBookRating = async (
  bookId: string,
  userId: string,
): Promise<BookRating | null> => {
  const database = await getDatabase();
  const rating = await database.getFirstAsync<BookRating>(
    "SELECT * FROM book_ratings WHERE book_id = ? AND user_id = ?",
    [bookId, userId],
  );
  return rating || null;
};

export const getBookAverageRating = async (bookId: string): Promise<number> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ avg_rating: number }>(
    "SELECT AVG(rating) as avg_rating FROM book_ratings WHERE book_id = ?",
    [bookId],
  );
  return result?.avg_rating ? Math.round(result.avg_rating * 10) / 10 : 0;
};

export const getBookRatingCount = async (bookId: string): Promise<number> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM book_ratings WHERE book_id = ?",
    [bookId],
  );
  return result?.count ?? 0;
};

// Coin transaction operations
export const addCoinTransaction = async (
  userId: string,
  amount: number,
  type: string,
  description: string,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT INTO coin_transactions (user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?)",
    [userId, amount, type, description, new Date().toISOString()],
  );
};

export const getCoinTransactions = async (
  userId: string,
): Promise<CoinTransaction[]> => {
  const database = await getDatabase();
  const transactions = await database.getAllAsync<CoinTransaction>(
    "SELECT * FROM coin_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [userId],
  );
  return transactions;
};

// Ad watch operations
export const recordAdWatch = async (
  userId: string,
  adType: string,
  coinsEarned: number,
): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT INTO ad_watches (user_id, ad_type, coins_earned, watched_at) VALUES (?, ?, ?, ?)",
    [userId, adType, coinsEarned, new Date().toISOString()],
  );
};

export const getLastAdWatch = async (
  userId: string,
  adType: string,
): Promise<AdWatch | null> => {
  const database = await getDatabase();
  const adWatch = await database.getFirstAsync<AdWatch>(
    "SELECT * FROM ad_watches WHERE user_id = ? AND ad_type = ? ORDER BY watched_at DESC LIMIT 1",
    [userId, adType],
  );
  return adWatch || null;
};
