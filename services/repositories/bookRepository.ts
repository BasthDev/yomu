import { buildBookCommentCounts } from "../../utils/bookFilters";
import { BookItem } from "../../utils/books";
import * as Database from "../../utils/database";
import { DUMMY_BOOKS } from "../../utils/dummyData";
import { novelRepository } from "./appwriteNovelRepository";

export interface BookRepository {
  getAllBooks(): Promise<BookItem[]>;
  getBookById(id: string): Promise<BookItem | null>;
  getCommentCountsByBook(): Promise<Record<string, number>>;
}

class LocalBookRepository implements BookRepository {
  async getAllBooks(): Promise<BookItem[]> {
    return DUMMY_BOOKS;
  }

  async getBookById(id: string): Promise<BookItem | null> {
    return DUMMY_BOOKS.find((b) => b.id === id) ?? null;
  }

  async getCommentCountsByBook(): Promise<Record<string, number>> {
    const chapterCounts = await Database.getCommentCountsByChapter();
    return buildBookCommentCounts(DUMMY_BOOKS, chapterCounts);
  }
}

// Appwrite-backed BookRepository implementation
class AppwriteBookRepository implements BookRepository {
  async getAllBooks(): Promise<BookItem[]> {
    try {
      // Use the adapter method from novelRepository
      const novels = await novelRepository.getAllNovels();
      if (novels.length > 0) {
        return novels.map(novel => ({
          id: novel.$id,
          title: novel.title,
          author: '', // TODO: Fetch author profile
          description: novel.description || '',
          coverUrl: novel.coverUrl,
          category: 'Fiction',
          rating: novel.averageRating,
          views: novel.viewCount,
          likes: novel.likeCount,
          chapters: [], // TODO: Fetch chapters
          status: novel.status === 'completed' ? 'Completed' : 'Ongoing',
          lastUpdated: novel.lastUpdatedAt || novel.$updatedAt,
        }));
      }
    } catch (error) {
      console.warn('Falling back to dummy books:', error);
    }
    // Fallback to dummy books if Appwrite is not configured or fails
    return DUMMY_BOOKS;
  }

  async getBookById(id: string): Promise<BookItem | null> {
    try {
      const novel = await novelRepository.getNovelById(id);
      if (novel) {
        return {
          id: novel.$id,
          title: novel.title,
          author: '', // TODO: Fetch author profile
          description: novel.description || '',
          coverUrl: novel.coverUrl,
          category: 'Fiction',
          rating: novel.averageRating,
          views: novel.viewCount,
          likes: novel.likeCount,
          chapters: [], // TODO: Fetch chapters
          status: novel.status === 'completed' ? 'Completed' : 'Ongoing',
          lastUpdated: novel.lastUpdatedAt || novel.$updatedAt,
        };
      }
    } catch (error) {
      console.warn('Falling back to dummy book:', error);
    }
    // Fallback to dummy book
    return DUMMY_BOOKS.find((b) => b.id === id) ?? null;
  }

  async getCommentCountsByBook(): Promise<Record<string, number>> {
    // Fallback to local database for now
    const chapterCounts = await Database.getCommentCountsByChapter();
    return buildBookCommentCounts(DUMMY_BOOKS, chapterCounts);
  }
}

// Check if Appwrite is configured
const isAppwriteConfigured = 
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT && 
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID &&
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID &&
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID !== 'your-project-id-here';

// Use Appwrite repository if configured, otherwise use local
export const bookRepository: BookRepository = isAppwriteConfigured
  ? new AppwriteBookRepository()
  : new LocalBookRepository();
