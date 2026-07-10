import { Query } from "appwrite";
import { BookItem } from "../../utils/books";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Novel {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  author_id: string;
  title: string;
  slug: string;
  description?: string;
  cover_url?: string;
  banner_url?: string;
  status: "draft" | "published" | "hiatus" | "completed";
  visibility: "public" | "private" | "unlisted";
  language: string;
  is_mature: boolean;
  word_count: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  rating_count: number;
  average_rating: number;
  chapter_count: number;
  is_monetized: boolean;
  monetization_type?: string;
  copyright_notice?: string;
  is_featured: boolean;
  featured_at?: string;
  published_at?: string;
  last_updated_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
}

export interface NovelRepository {
  getAllNovels(): Promise<Novel[]>;
  getNovelById(id: string): Promise<Novel | null>;
  getNovelsByAuthor(authorId: string): Promise<Novel[]>;
  searchNovels(query: string): Promise<Novel[]>;
  createNovel(data: Partial<Novel>): Promise<Novel>;
  updateNovel(id: string, data: Partial<Novel>): Promise<Novel>;
  deleteNovel(id: string): Promise<void>;
}

class AppwriteNovelRepository implements NovelRepository {
  async getAllNovels(): Promise<Novel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        [
          Query.equal("is_deleted", false),
          Query.equal("status", "published"),
          Query.orderDesc("$createdAt"),
        ],
      );
      return response.documents as unknown as Novel[];
    } catch (error) {
      console.error("Error fetching novels:", error);
      return [];
    }
  }

  async getNovelById(id: string): Promise<Novel | null> {
    try {
      const novel = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        id,
      );
      return novel as unknown as Novel;
    } catch (error) {
      console.error("Error fetching novel by id:", error);
      return null;
    }
  }

  async getNovelsByAuthor(authorId: string): Promise<Novel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        [
          Query.equal("author_id", authorId),
          Query.equal("is_deleted", false),
          Query.orderDesc("$createdAt"),
        ],
      );
      return response.documents as unknown as Novel[];
    } catch (error) {
      console.error("Error fetching novels by author:", error);
      return [];
    }
  }

  async searchNovels(query: string): Promise<Novel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOVELS,
        [
          Query.search("title", query),
          Query.equal("is_deleted", false),
          Query.equal("status", "published"),
        ],
      );
      return response.documents as unknown as Novel[];
    } catch (error) {
      console.error("Error searching novels:", error);
      return [];
    }
  }

  async createNovel(data: Partial<Novel>): Promise<Novel> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...novelData
    } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.NOVELS,
      "unique()",
      {
        ...novelData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
    return response as unknown as Novel;
  }

  async updateNovel(id: string, data: Partial<Novel>): Promise<Novel> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...novelData
    } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.NOVELS,
      id,
      {
        ...novelData,
        updatedAt: new Date().toISOString(),
      },
    );
    return response as unknown as Novel;
  }

  async deleteNovel(id: string): Promise<void> {
    // Soft delete
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOVELS, id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    });
  }

  // Adapter method to support existing BookItem interface
  async getAllBooks(): Promise<BookItem[]> {
    const novels = await this.getAllNovels();
    return novels.map((novel) => ({
      id: novel.$id,
      title: novel.title,
      description: novel.description || "",
      genre: ["Fiction"], // Default genre, should be fetched from novel_genres
      banner: novel.banner_url || "",
      cover: novel.cover_url || "",
      isHot: novel.is_featured,
      status:
        novel.status === "completed"
          ? "Completed"
          : novel.status === "hiatus"
            ? "Hiatus"
            : "Ongoing",
      rating: novel.average_rating,
      author: "", // We'd need to fetch author data separately
      authorId: novel.author_id,
      isFree: !novel.is_monetized,
      viewsCount: novel.view_count,
      favoritesCount: novel.like_count, // Using like_count as favoritesCount for now
      createdAt: novel.$createdAt,
      updatedAt: novel.last_updated_at || novel.$updatedAt,
      chaptersList: [], // We'd need to fetch chapters separately
      comments: [], // We'd need to fetch comments separately
    }));
  }

  // Adapter method to support existing BookItem interface
  async getBookById(id: string): Promise<BookItem | null> {
    const novel = await this.getNovelById(id);
    if (!novel) return null;
    return {
      id: novel.$id,
      title: novel.title,
      description: novel.description || "",
      genre: ["Fiction"], // Default genre, should be fetched from novel_genres
      banner: novel.banner_url || "",
      cover: novel.cover_url || "",
      isHot: novel.is_featured,
      status:
        novel.status === "completed"
          ? "Completed"
          : novel.status === "hiatus"
            ? "Hiatus"
            : "Ongoing",
      rating: novel.average_rating,
      author: "", // We'd need to fetch author data separately
      authorId: novel.author_id,
      isFree: !novel.is_monetized,
      viewsCount: novel.view_count,
      favoritesCount: novel.like_count, // Using like_count as favoritesCount for now
      createdAt: novel.$createdAt,
      updatedAt: novel.last_updated_at || novel.$updatedAt,
      chaptersList: [], // We'd need to fetch chapters separately
      comments: [], // We'd need to fetch comments separately
    };
  }
}

export const novelRepository: NovelRepository = new AppwriteNovelRepository();
