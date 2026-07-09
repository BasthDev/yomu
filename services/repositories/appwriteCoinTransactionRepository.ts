import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export type TransactionType = "earn" | "spend" | "purchase" | "refund" | "reward" | "penalty";

export interface CoinTransaction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description?: string;
  relatedId?: string; // novel_id, chapter_id, etc.
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoinTransactionRepository {
  getTransactionsByUser(userId: string, limit?: number): Promise<CoinTransaction[]>;
  getTransactionById(id: string): Promise<CoinTransaction | null>;
  createTransaction(data: Partial<CoinTransaction>): Promise<CoinTransaction>;
  getUserBalance(userId: string): Promise<number>;
}

class AppwriteCoinTransactionRepository implements CoinTransactionRepository {
  async getTransactionsByUser(userId: string, limit = 50): Promise<CoinTransaction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COIN_TRANSACTIONS,
        [
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ]
      );
      return response.documents as unknown as CoinTransaction[];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  async getTransactionById(id: string): Promise<CoinTransaction | null> {
    try {
      const transaction = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.COIN_TRANSACTIONS,
        id
      );
      return transaction as unknown as CoinTransaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async createTransaction(data: Partial<CoinTransaction>): Promise<CoinTransaction> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...transactionData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.COIN_TRANSACTIONS,
      "unique()",
      {
        ...transactionData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as CoinTransaction;
  }

  async getUserBalance(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COIN_TRANSACTIONS,
        [
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]
      );
      if (response.documents.length > 0) {
        const transaction = response.documents[0] as unknown as CoinTransaction;
        return transaction.balanceAfter || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching user balance:", error);
      return 0;
    }
  }
}

export const coinTransactionRepository: CoinTransactionRepository = new AppwriteCoinTransactionRepository();
