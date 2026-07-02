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
    
    CREATE INDEX IF NOT EXISTS idx_reading_history_book_id ON reading_history(book_id);
  `);

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
