import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Review {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  novelId: string;
  rating: number;
  content?: string;
  likesCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRepository {
  getReviewsByNovel(novelId: string): Promise<Review[]>;
  getUserReview(userId: string, novelId: string): Promise<Review | null>;
  createReview(data: Partial<Review>): Promise<Review>;
  updateReview(id: string, data: Partial<Review>): Promise<Review>;
  deleteReview(id: string): Promise<void>;
}

class AppwriteReviewRepository implements ReviewRepository {
  async getReviewsByNovel(novelId: string): Promise<Review[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        [
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents as unknown as Review[];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }

  async getUserReview(userId: string, novelId: string): Promise<Review | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        [
          Query.equal("userId", userId),
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.limit(1),
        ]
      );
      return (response.documents[0] as unknown as Review) || null;
    } catch (error) {
      console.error("Error fetching user review:", error);
      return null;
    }
  }

  async createReview(data: Partial<Review>): Promise<Review> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...reviewData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REVIEWS,
      "unique()",
      {
        ...reviewData,
        likesCount: 0,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Review;
  }

  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...reviewData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.REVIEWS,
      id,
      {
        ...reviewData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Review;
  }

  async deleteReview(id: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.REVIEWS,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const reviewRepository: ReviewRepository = new AppwriteReviewRepository();
