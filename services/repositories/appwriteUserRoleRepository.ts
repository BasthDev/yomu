import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export type UserRoleType =
  | "reader"
  | "writer"
  | "editor"
  | "moderator"
  | "admin";

export interface UserRole {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  role: UserRoleType;
  assignedBy?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleRepository {
  getUserRoles(userId: string): Promise<UserRole[]>;
  hasRole(userId: string, role: UserRoleType): Promise<boolean>;
  assignRole(data: Partial<UserRole>): Promise<UserRole>;
  removeRole(id: string): Promise<void>;
}

class AppwriteUserRoleRepository implements UserRoleRepository {
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_ROLES,
        [Query.equal("userId", userId), Query.equal("isDeleted", false)],
      );
      return response.documents as unknown as UserRole[];
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
  }

  async hasRole(userId: string, role: UserRoleType): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some((r) => r.role === role);
  }

  async assignRole(data: Partial<UserRole>): Promise<UserRole> {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $databaseId,
      $collectionId,
      ...roleData
    } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_ROLES,
      "unique()",
      {
        ...roleData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
    return response as unknown as UserRole;
  }

  async removeRole(id: string): Promise<void> {
    // Soft delete
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.USER_ROLES, id, {
      isDeleted: true,
    });
  }
}

export const userRoleRepository: UserRoleRepository =
  new AppwriteUserRoleRepository();
