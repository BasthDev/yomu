import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export type PurchaseType = "chapter" | "volume" | "novel" | "subscription";

export interface Purchase {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  type: PurchaseType;
  itemId: string; // chapter_id, volume_id, novel_id, etc.
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRepository {
  getPurchasesByUser(userId: string): Promise<Purchase[]>;
  getPurchaseById(id: string): Promise<Purchase | null>;
  createPurchase(data: Partial<Purchase>): Promise<Purchase>;
  updatePurchaseStatus(id: string, status: Purchase["status"]): Promise<Purchase>;
}

class AppwritePurchaseRepository implements PurchaseRepository {
  async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PURCHASES,
        [
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents as unknown as Purchase[];
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }
  }

  async getPurchaseById(id: string): Promise<Purchase | null> {
    try {
      const purchase = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.PURCHASES,
        id
      );
      return purchase as unknown as Purchase;
    } catch (error) {
      console.error("Error fetching purchase:", error);
      return null;
    }
  }

  async createPurchase(data: Partial<Purchase>): Promise<Purchase> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...purchaseData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      "unique()",
      {
        ...purchaseData,
        status: "pending",
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Purchase;
  }

  async updatePurchaseStatus(id: string, status: Purchase["status"]): Promise<Purchase> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PURCHASES,
      id,
      {
        status,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Purchase;
  }
}

export const purchaseRepository: PurchaseRepository = new AppwritePurchaseRepository();
