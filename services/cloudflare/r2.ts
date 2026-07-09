// Cloudflare R2 service for object storage (S3-compatible)
// This service handles all file uploads with folder-based organization

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface R2File {
  name: string;
  type: string;
  size: number;
  uri: string;
}

export interface R2Service {
  uploadFile(
    folder: string,
    file: R2File,
  ): Promise<string>;
  getFileUrl(folder: string, fileName: string): string;
  deleteFile(folder: string, fileName: string): Promise<void>;
  listFiles(folder?: string): Promise<any>;
}

class R2ServiceImpl implements R2Service {
  private config: R2Config;
  private client: S3Client;

  constructor() {
    this.config = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    };

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async uploadFile(folder: string, file: R2File): Promise<string> {
    try {
      // Generate unique file ID
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const fileName = `${folder}/${fileId}`;

      // Read file content
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          folder: folder,
        },
      });

      await this.client.send(command);
      return fileId;
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw error;
    }
  }

  getFileUrl(folder: string, fileName: string): string {
    // R2 public URL format (if bucket is public)
    // For private buckets, you'll need to implement presigned URLs
    return `https://pub-${this.config.accountId}.r2.dev/${this.config.bucketName}/${folder}/${fileName}`;
  }

  async deleteFile(folder: string, fileName: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: `${folder}/${fileName}`,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw error;
    }
  }

  async listFiles(folder?: string): Promise<any> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: folder ? `${folder}/` : undefined,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Error listing files from R2:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const r2Service: R2Service = new R2ServiceImpl();

// Convenience methods for specific folders
export const uploadNovelCover = (file: R2File) =>
  r2Service.uploadFile('novel-covers', file);

export const uploadNovelBanner = (file: R2File) =>
  r2Service.uploadFile('novel-banners', file);

export const uploadProfileImage = (file: R2File) =>
  r2Service.uploadFile('profile-images', file);

export const uploadChapterImage = (file: R2File) =>
  r2Service.uploadFile('chapter-images', file);

export const uploadInlineImage = (file: R2File) =>
  r2Service.uploadFile('inline-images', file);

export const uploadBanner = (file: R2File) =>
  r2Service.uploadFile('banners', file);

export const uploadAd = (file: R2File) =>
  r2Service.uploadFile('ads', file);

export const uploadAudio = (file: R2File) =>
  r2Service.uploadFile('audio', file);

export const uploadVideo = (file: R2File) =>
  r2Service.uploadFile('videos', file);

export const uploadDocument = (file: R2File) =>
  r2Service.uploadFile('documents', file);

export const uploadTemporaryFile = (file: R2File) =>
  r2Service.uploadFile('temporary-uploads', file);
