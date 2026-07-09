import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export interface Comment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  chapterId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  likesCount: number;
  repliesCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRepository {
  getCommentsByChapter(chapterId: string): Promise<Comment[]>;
  getCommentById(id: string): Promise<Comment | null>;
  getReplies(parentCommentId: string): Promise<Comment[]>;
  createComment(data: Partial<Comment>): Promise<Comment>;
  updateComment(id: string, data: Partial<Comment>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
}

class AppwriteCommentRepository implements CommentRepository {
  async getCommentsByChapter(chapterId: string): Promise<Comment[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        [
          Query.equal("chapterId", chapterId),
          Query.equal("isDeleted", false),
          Query.isNull("parentCommentId"),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents as unknown as Comment[];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  async getCommentById(id: string): Promise<Comment | null> {
    try {
      const comment = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        id
      );
      return comment as unknown as Comment;
    } catch (error) {
      console.error("Error fetching comment:", error);
      return null;
    }
  }

  async getReplies(parentCommentId: string): Promise<Comment[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        [
          Query.equal("parentCommentId", parentCommentId),
          Query.equal("isDeleted", false),
          Query.orderAsc("$createdAt"),
        ]
      );
      return response.documents as unknown as Comment[];
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  }

  async createComment(data: Partial<Comment>): Promise<Comment> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...commentData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      "unique()",
      {
        ...commentData,
        likesCount: 0,
        repliesCount: 0,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Comment;
  }

  async updateComment(id: string, data: Partial<Comment>): Promise<Comment> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...commentData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      id,
      {
        ...commentData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Comment;
  }

  async deleteComment(id: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      id,
      {
        isDeleted: true,
      }
    );
  }
}

export const commentRepository: CommentRepository = new AppwriteCommentRepository();
