import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Profile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.limit(1),
        ]
      );
      return (response.documents[0] as unknown as Profile) || null;
    } catch (error) {
      console.error("Error fetching profile by user ID:", error);
      return null;
    }
  }

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...profileData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      "unique()",
      {
        ...profileData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Profile;
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...profileData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      id,
      {
        ...profileData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Profile;
  }

  async deleteProfile(id: string): Promise<void> {
    // Soft delete
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const profileRepository: ProfileRepository = new AppwriteProfileRepository();
