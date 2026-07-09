import { Account, ID } from "appwrite";
import { client, DATABASE_ID, COLLECTIONS } from "./config";
import { profileRepository } from "../repositories";

// Initialize Appwrite Account service
const account = new Account(client);

export interface AuthService {
  createSessionFromClerk(clerkUserId: string, clerkToken: string): Promise<void>;
  syncUserProfile(clerkUserId: string, email: string, name?: string): Promise<void>;
  getCurrentSession(): Promise<any>;
  deleteSession(): Promise<void>;
  signOut(): Promise<void>;
}

class AppwriteAuthService implements AuthService {
  async createSessionFromClerk(clerkUserId: string, clerkToken: string): Promise<void> {
    try {
      // Create Appwrite session using JWT from Clerk
      // Note: This is a simplified version. In production, you'd exchange Clerk JWT for Appwrite session
      // For now, we'll create an anonymous session and link it to the user profile
      await account.createAnonymousSession();
      
      // Sync user profile
      await this.syncUserProfile(clerkUserId, "", "");
    } catch (error) {
      console.error("Error creating Appwrite session from Clerk:", error);
      throw error;
    }
  }

  async syncUserProfile(clerkUserId: string, email: string, name?: string): Promise<void> {
    try {
      // Check if profile exists
      const existingProfile = await profileRepository.getProfileByUserId(clerkUserId);
      
      if (existingProfile) {
        // Update existing profile
        await profileRepository.updateProfile(existingProfile.$id, {
          displayName: name || existingProfile.displayName,
        });
      } else {
        // Create new profile
        await profileRepository.createProfile({
          userId: clerkUserId,
          displayName: name || "User",
          bio: "",
          avatarUrl: "",
          website: "",
          socialLinks: {},
        });
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
      throw error;
    }
  }

  async getCurrentSession(): Promise<any> {
    try {
      return await account.get();
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  async deleteSession(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }
}

export const authService: AuthService = new AppwriteAuthService();
