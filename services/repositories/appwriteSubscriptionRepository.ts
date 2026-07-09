import { Query } from "appwrite";
import { COLLECTIONS, DATABASE_ID, databases } from "../appwrite/config";

export type SubscriptionPlan = "free" | "basic" | "premium" | "ultimate";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "pending";

export interface Subscription {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  coinsPerMonth: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRepository {
  getUserSubscription(userId: string): Promise<Subscription | null>;
  getSubscriptionById(id: string): Promise<Subscription | null>;
  createSubscription(data: Partial<Subscription>): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  cancelSubscription(id: string): Promise<void>;
}

class AppwriteSubscriptionRepository implements SubscriptionRepository {
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        [
          Query.equal("userId", userId),
          Query.equal("isDeleted", false),
          Query.equal("status", "active"),
          Query.limit(1),
        ]
      );
      return (response.documents[0] as unknown as Subscription) || null;
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      return null;
    }
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    try {
      const subscription = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SUBSCRIPTIONS,
        id
      );
      return subscription as unknown as Subscription;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  }

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...subscriptionData } = data as any;
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      "unique()",
      {
        ...subscriptionData,
        status: "active",
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Subscription;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...subscriptionData } = data as any;
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      id,
      {
        ...subscriptionData,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as Subscription;
  }

  async cancelSubscription(id: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      id,
      {
        status: "cancelled",
        autoRenew: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }
}

export const subscriptionRepository: SubscriptionRepository = new AppwriteSubscriptionRepository();
