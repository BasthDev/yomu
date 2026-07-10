import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Profile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  social_links?: string;
  coins?: number;
  is_deleted: boolean;
}

export interface ProfileRepository {
  getProfileByUserId(userId: string): Promise<Profile | null>;
  createProfile(data: Partial<Profile>): Promise<Profile>;
  updateProfile(id: string, data: Partial<Profile>): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;
}

class AppwriteProfileRepository implements ProfileRepository {
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [
          Query.equal("user_id", userId),
          Query.equal("is_deleted", false),
          Query.limit(1),
        ],
      );
      return (response.documents[0] as unknown as Profile) || null;
    } catch (error) {
      console.error("Error fetching profile by user ID:", error);
      return null;
    }
  }

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...profileData
    } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      "unique()",
      {
        ...profileData,
        is_deleted: false,
        coins: 0,
      },
    );
    return response as unknown as Profile;
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...profileData
    } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      id,
      profileData,
    );
    return response as unknown as Profile;
  }

  async deleteProfile(id: string): Promise<void> {
    // Soft delete
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, id, {
      is_deleted: true,
    });
  }
}

export const profileRepository: ProfileRepository =
  new AppwriteProfileRepository();
