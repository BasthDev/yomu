import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Rating {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  novelId: string;
  rating: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingRepository {
  getUserRating(userId: string, novelId: string): Promise<Rating | null>;
  getRatingsByNovel(novelId: string): Promise<Rating[]>;
  createRating(data: Partial<Rating>): Promise<Rating>;
  updateRating(id: string, data: Partial<Rating>): Promise<Rating>;
  deleteRating(id: string): Promise<void>;
}

class AppwriteRatingRepository implements RatingRepository {
  async getUserRating(userId: string, novelId: string): Promise<Rating | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RATINGS,
        [
          Query.equal("userId", userId),
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.limit(1),
        ]
      );
      return (response.documents[0] as unknown as Rating) || null;
    } catch (error) {
      console.error("Error fetching user rating:", error);
      return null;
    }
  }

  async getRatingsByNovel(novelId: string): Promise<Rating[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RATINGS,
        [
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents as unknown as Rating[];
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return [];
    }
  }

  async createRating(data: Partial<Rating>): Promise<Rating> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...ratingData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      "unique()",
      {
        ...ratingData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Rating;
  }

  async updateRating(id: string, data: Partial<Rating>): Promise<Rating> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...ratingData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      id,
      {
        ...ratingData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Rating;
  }

  async deleteRating(id: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const ratingRepository: RatingRepository = new AppwriteRatingRepository();
