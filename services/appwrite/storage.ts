import { ID } from "appwrite";
import * as FileSystem from "expo-file-system";
import { BUCKETS, storage } from "./config";

export interface StorageService {
  uploadFile(
    folder: string,
    file: {
      name: string;
      type: string;
      size: number;
      uri: string;
    },
  ): Promise<string>;
  getFilePreview(folder: string, fileId: string): string;
  getFileView(folder: string, fileId: string): string;
  deleteFile(folder: string, fileId: string): Promise<void>;
  listFiles(folder?: string, limit?: number, offset?: number): Promise<any>;
}

class AppwriteStorageService implements StorageService {
  async uploadFile(
    folder: string,
    file: {
      name: string;
      type: string;
      size: number;
      uri: string;
    },
  ): Promise<string> {
    try {
      // Use folder-based file ID: folder/uniqueId
      const fileId = ID.unique();
      const fileWithPath = `${folder}/${fileId}`;

      // For React Native, read file using FileSystem
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create a File object from base64 content
      const base64Data = `data:${file.type};base64,${fileContent}`;
      const response = await fetch(base64Data);
      const blob = await response.blob();

      const fileResponse = await storage.createFile(
        BUCKETS.STORAGE,
        fileWithPath,
        blob as any,
      );
      return fileResponse.$id;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  getFilePreview(folder: string, fileId: string): string {
    const fileWithPath = `${folder}/${fileId}`;
    return storage.getFilePreview(BUCKETS.STORAGE, fileWithPath);
  }

  getFileView(folder: string, fileId: string): string {
    const fileWithPath = `${folder}/${fileId}`;
    return storage.getFileView(BUCKETS.STORAGE, fileWithPath);
  }

  async deleteFile(folder: string, fileId: string): Promise<void> {
    try {
      const fileWithPath = `${folder}/${fileId}`;
      await storage.deleteFile(BUCKETS.STORAGE, fileWithPath);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async listFiles(
    folder?: string,
    limit?: number,
    offset?: number,
  ): Promise<any> {
    try {
      const response = await storage.listFiles(BUCKETS.STORAGE);
      // Filter by folder if specified
      if (folder) {
        response.files = response.files.filter((file: any) =>
          file.name.startsWith(folder + "/"),
        );
      }
      return response;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }
}

export const storageService: StorageService = new AppwriteStorageService();

// Convenience methods for non-image files (documents, audio, videos)
// Images are handled by Cloudflare Images service
export const uploadAudio = (file: {
  name: string;
  type: string;
  size: number;
  uri: string;
}) => storageService.uploadFile(BUCKETS.AUDIO, file);

export const uploadVideo = (file: {
  name: string;
  type: string;
  size: number;
  uri: string;
}) => storageService.uploadFile(BUCKETS.VIDEOS, file);

export const uploadDocument = (file: {
  name: string;
  type: string;
  size: number;
  uri: string;
}) => storageService.uploadFile(BUCKETS.DOCUMENTS, file);

export const uploadTemporaryFile = (file: {
  name: string;
  type: string;
  size: number;
  uri: string;
}) => storageService.uploadFile(BUCKETS.TEMPORARY_UPLOADS, file);
