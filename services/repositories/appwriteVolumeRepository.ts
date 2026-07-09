import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Volume {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  novelId: string;
  volumeNumber: number;
  title: string;
  description?: string;
  coverUrl?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VolumeRepository {
  getVolumesByNovel(novelId: string): Promise<Volume[]>;
  getVolumeById(id: string): Promise<Volume | null>;
  getVolumeByNumber(novelId: string, volumeNumber: number): Promise<Volume | null>;
  createVolume(data: Partial<Volume>): Promise<Volume>;
  updateVolume(id: string, data: Partial<Volume>): Promise<Volume>;
  deleteVolume(id: string): Promise<void>;
}

class AppwriteVolumeRepository implements VolumeRepository {
  async getVolumesByNovel(novelId: string): Promise<Volume[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VOLUMES,
        [
          Query.equal("novelId", novelId),
          Query.equal("isDeleted", false),
          Query.orderAsc("volumeNumber"),
        ]
      );
      return response.documents as unknown as Volume[];
    } catch (error) {
      console.error("Error fetching volumes:", error);
      return [];
    }
  }

  async getVolumeById(id: string): Promise<Volume | null> {
    try {
      const volume = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.VOLUMES,
        id
      );
      return volume as unknown as Volume;
    } catch (error) {
      console.error("Error fetching volume by ID:", error);
      return null;
    }
  }

  async getVolumeByNumber(novelId: string, volumeNumber: number): Promise<Volume | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VOLUMES,
        [
          Query.equal("novelId", novelId),
          Query.equal("volumeNumber", volumeNumber),
          Query.equal("isDeleted", false),
          Query.limit(1),
        ]
      );
      return (response.documents[0] as unknown as Volume) || null;
    } catch (error) {
      console.error("Error fetching volume by number:", error);
      return null;
    }
  }

  async createVolume(data: Partial<Volume>): Promise<Volume> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...volumeData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.VOLUMES,
      "unique()",
      {
        ...volumeData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Volume;
  }

  async updateVolume(id: string, data: Partial<Volume>): Promise<Volume> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...volumeData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.VOLUMES,
      id,
      {
        ...volumeData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Volume;
  }

  async deleteVolume(id: string): Promise<void> {
    // Soft delete
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.VOLUMES,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const volumeRepository: VolumeRepository = new AppwriteVolumeRepository();
