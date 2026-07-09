import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

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
  status: "draft" | "published";
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
  getChapterByNumber(
    novelId: string,
    chapterNumber: number,
  ): Promise<Chapter | null>;
  createChapter(data: Partial<Chapter>): Promise<Chapter>;
  updateChapter(id: string, data: Partial<Chapter>): Promise<Chapter>;
  deleteChapter(id: string): Promise<void>;
}

class AppwriteChapterRepository implements ChapterRepository {
  async getChaptersByNovel(novelId: string): Promise<Chapter[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAPTERS,
        [
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.equal("status", "published"),
          Query.orderAsc("chapterNumber"),
        ],
      );
      return response.documents as unknown as Chapter[];
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return [];
    }
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    try {
      const chapter = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CHAPTERS,
        id,
      );
      return chapter as unknown as Chapter;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return null;
    }
  }

  async getChapterByNumber(
    novelId: string,
    chapterNumber: number,
  ): Promise<Chapter | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAPTERS,
        [
          Query.equal("novelId", novelId),
          Query.equal("chapterNumber", chapterNumber),
          Query.equal("isDeleted", false),
        ],
      );
      return (response.documents[0] as unknown as Chapter) || null;
    } catch (error) {
      console.error("Error fetching chapter by number:", error);
      return null;
    }
  }

  async createChapter(data: Partial<Chapter>): Promise<Chapter> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...chapterData
    } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CHAPTERS,
      "unique()",
      {
        ...chapterData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
    return response as unknown as Chapter;
  }

  async updateChapter(id: string, data: Partial<Chapter>): Promise<Chapter> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...chapterData
    } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CHAPTERS,
      id,
      {
        ...chapterData,
        updatedAt: new Date().toISOString(),
      },
    );
    return response as unknown as Chapter;
  }

  async deleteChapter(id: string): Promise<void> {
    // Soft delete
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.CHAPTERS, id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    });
  }
}

export const chapterRepository: ChapterRepository =
  new AppwriteChapterRepository();
