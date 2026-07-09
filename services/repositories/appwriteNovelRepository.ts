import { Query } from 'appwrite';
import { BookItem } from '../../utils/books';
import { COLLECTIONS, DATABASE_ID, databases } from '../appwrite/config';

export interface Novel {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  authorId: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  bannerUrl?: string;
  status: 'draft' | 'published' | 'hiatus' | 'completed';
  visibility: 'public' | 'private' | 'unlisted';
  language: string;
  isMature: boolean;
  wordCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  ratingCount: number;
  averageRating: number;
  chapterCount: number;
  isMonetized: boolean;
  monetizationType?: string;
  copyrightNotice?: string;
  isFeatured: boolean;
  featuredAt?: string;
  publishedAt?: string;
  lastUpdatedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface NovelRepository {
  getAllNovels(): Promise<Novel[]>;
  getNovelById(id: string): Promise<Novel | null>;
  getNovelsByAuthor(authorId: string): Promise<Novel[]>;
  searchNovels(query: string): Promise<Novel[]>;
}

class AppwriteNovelRepository implements NovelRepository {
  async getAllNovels(): Promise<Novel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        [
          Query.equal('isDeleted', false),
          Query.equal('status', 'published'),
          Query.orderDesc('$createdAt'),
        ]
      );
      return response.documents as unknown as Novel[];
    } catch (error) {
      console.error('Error fetching novels:', error);
      return [];
    }
  }

  async getNovelById(id: string): Promise<Novel | null> {
    try {
      const novel = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        id
      );
      return novel as unknown as Novel;
    } catch (error) {
      console.error('Error fetching novel by id:', error);
      return null;
    }
  }

  async getNovelsByAuthor(authorId: string): Promise<Novel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        [
          Query.equal('authorId', authorId),
          Query.equal('isDeleted', false),
          Query.orderDesc('$createdAt'),
        ]
      );
      return response.documents as unknown as Novel[];
    } catch (error) {
      console.error('Error fetching novels by author:', error);
      return [];
    }
  }

  async searchNovels(query: string): Promise<Novel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        [
          Query.search('title', query),
          Query.equal('isDeleted', false),
          Query.equal('status', 'published'),
        ]
      );
      return response.documents as unknown as Novel[];
    } catch (error) {
      console.error('Error searching novels:', error);
      return [];
    }
  }

  // Adapter method to support existing BookItem interface
  async getAllBooks(): Promise<BookItem[]> {
    const novels = await this.getAllNovels();
    return novels.map(novel => ({
      id: novel.$id,
      title: novel.title,
      author: '', // We'd need to fetch author data separately
      description: novel.description || '',
      coverUrl: novel.coverUrl,
      category: 'Fiction',
      rating: novel.averageRating,
      views: novel.viewCount,
      likes: novel.likeCount,
      chapters: [], // We'd need to fetch chapters separately
      status: novel.status === 'completed' ? 'Completed' : 'Ongoing',
      lastUpdated: novel.lastUpdatedAt || novel.$updatedAt,
    }));
  }

  // Adapter method to support existing BookItem interface
  async getBookById(id: string): Promise<BookItem | null> {
    const novel = await this.getNovelById(id);
    if (!novel) return null;
    return {
      id: novel.$id,
      title: novel.title,
      author: '',
      description: novel.description || '',
      coverUrl: novel.coverUrl,
      category: 'Fiction',
      rating: novel.averageRating,
      views: novel.viewCount,
      likes: novel.likeCount,
      chapters: [],
      status: novel.status === 'completed' ? 'Completed' : 'Ongoing',
      lastUpdated: novel.lastUpdatedAt || novel.$updatedAt,
    };
  }
}

export const novelRepository: NovelRepository = new AppwriteNovelRepository();
