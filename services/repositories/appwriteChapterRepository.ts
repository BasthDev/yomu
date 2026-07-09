import { Query } from 'appwrite';
import { COLLECTIONS, DATABASE_ID, databases } from '../appwrite/config';

export interface Chapter {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  novelId: string;
  volumeId?: string;
  title: string;
  slug: string;
  chapterNumber: number;
  content: string;
  wordCount: number;
  status: 'draft' | 'published';
  isPremium: boolean;
  coinCost?: number;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  authorNote?: string;
  publishedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface ChapterRepository {
  getChaptersByNovel(novelId: string): Promise<Chapter[]>;
  getChapterById(id: string): Promise<Chapter | null>;
  getChapterByNumber(novelId: string, chapterNumber: number): Promise<Chapter | null>;
}

class AppwriteChapterRepository implements ChapterRepository {
  async getChaptersByNovel(novelId: string): Promise<Chapter[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAPTERS,
        [
          Query.equal('novelId', novelId),
          Query.equal('isDeleted', false),
          Query.equal('status', 'published'),
          Query.orderAsc('chapterNumber'),
        ]
      );
      return response.documents as unknown as Chapter[];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    try {
      const chapter = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CHAPTERS,
        id
      );
      return chapter as unknown as Chapter;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return null;
    }
  }

  async getChapterByNumber(novelId: string, chapterNumber: number): Promise<Chapter | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAPTERS,
        [
          Query.equal('novelId', novelId),
          Query.equal('chapterNumber', chapterNumber),
          Query.equal('isDeleted', false),
        ]
      );
      return response.documents[0] as unknown as Chapter || null;
    } catch (error) {
      console.error('Error fetching chapter by number:', error);
      return null;
    }
  }
}

export const chapterRepository: ChapterRepository = new AppwriteChapterRepository();
