import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Bookmark {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  novelId: string;
  chapterId?: string;
  position?: number;
  note?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkRepository {
  getBookmarksByUser(userId: string): Promise<Bookmark[]>;
  getBookmark(userId: string, novelId: string): Promise<Bookmark | null>;
  createBookmark(data: Partial<Bookmark>): Promise<Bookmark>;
  updateBookmark(id: string, data: Partial<Bookmark>): Promise<Bookmark>;
  deleteBookmark(id: string): Promise<void>;
}

class AppwriteBookmarkRepository implements BookmarkRepository {
  async getBookmarksByUser(userId: string): Promise<Bookmark[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents as unknown as Bookmark[];
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      return [];
    }
  }

  async getBookmark(userId: string, novelId: string): Promise<Bookmark | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKMARKS,
        [
          Query.equal("userId", userId),
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.limit(1),
        ]
      );
      return (response.documents[0] as unknown as Bookmark) || null;
    } catch (error) {
      console.error("Error fetching bookmark:", error);
      return null;
    }
  }

  async createBookmark(data: Partial<Bookmark>): Promise<Bookmark> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...bookmarkData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      "unique()",
      {
        ...bookmarkData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Bookmark;
  }

  async updateBookmark(id: string, data: Partial<Bookmark>): Promise<Bookmark> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...bookmarkData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      id,
      {
        ...bookmarkData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Bookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.BOOKMARKS,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const bookmarkRepository: BookmarkRepository = new AppwriteBookmarkRepository();
