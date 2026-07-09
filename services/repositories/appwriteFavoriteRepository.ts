import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Favorite {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  novelId: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface FavoriteRepository {
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  isFavorite(userId: string, novelId: string): Promise<boolean>;
  addFavorite(data: Partial<Favorite>): Promise<Favorite>;
  removeFavorite(id: string): Promise<void>;
}

class AppwriteFavoriteRepository implements FavoriteRepository {
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        [
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents as unknown as Favorite[];
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  }

  async isFavorite(userId: string, novelId: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FAVORITES,
        [
          Query.equal("userId", userId),
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.limit(1),
        ]
      );
      return response.documents.length > 0;
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  }

  async addFavorite(data: Partial<Favorite>): Promise<Favorite> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...favoriteData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.FAVORITES,
      "unique()",
      {
        ...favoriteData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      }
    );
    return response as unknown as Favorite;
  }

  async removeFavorite(id: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.FAVORITES,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const favoriteRepository: FavoriteRepository = new AppwriteFavoriteRepository();
