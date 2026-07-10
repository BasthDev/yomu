import { Account, ID } from "appwrite";
import { profileRepository } from "../repositories";
import { client } from "./config";

// Initialize Appwrite Account service
const account = new Account(client);

export interface AuthService {
  signUp(email: string, password: string, name?: string): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<any>;
  getCurrentUser(): Promise<any>;
  syncUserProfile(userId: string, email: string, name?: string): Promise<void>;
  updateEmail(newEmail: string, password: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPasswordWithCode(
    userId: string,
    secret: string,
    newPassword: string,
  ): Promise<void>;
}

class AppwriteAuthService implements AuthService {
  async signUp(email: string, password: string, name?: string): Promise<any> {
    try {
      // Create account
      const user = await account.create(
        ID.unique(),
        email,
        password,
        name || "User",
      );

      // Create session
      const session = await account.createEmailPasswordSession(email, password);

      // Sync user profile
      await this.syncUserProfile(user.$id, email, name);

      return { user, session };
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      // Sync user profile
      await this.syncUserProfile(user.$id, email, user.name);

      return { user, session };
    } catch (error) {
      console.error("Error signing in:", error);
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

  async getCurrentSession(): Promise<any> {
    try {
      return await account.get();
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      return await account.get();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async syncUserProfile(
    userId: string,
    email: string,
    name?: string,
  ): Promise<void> {
    try {
      // Check if profile exists
      const existingProfile =
        await profileRepository.getProfileByUserId(userId);

      if (existingProfile) {
        // Update existing profile
        await profileRepository.updateProfile(existingProfile.$id, {
          display_name: name || existingProfile.display_name,
        });
      } else {
        // Create new profile
        await profileRepository.createProfile({
          user_id: userId,
          display_name: name || "User",
          bio: "",
          avatar_url: "",
          website: "",
          social_links: "{}",
        });
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
      // Don't throw error - auth should succeed even if profile sync fails
    }
  }

  async updateEmail(newEmail: string, password: string): Promise<void> {
    try {
      await account.updateEmail(newEmail, password);
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await account.updatePassword(newPassword, currentPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Use a simple URL - Appwrite will send the email with reset parameters
      // The user can manually construct the deep link from the email parameters
      const resetUrl =
        // process.env.EXPO_PUBLIC_RESET_PASSWORD_URL ||
        "https://yomu.app/reset-password";
      await account.createRecovery(email, resetUrl);
    } catch (error) {
      console.error("Error sending forgot password email:", error);
      throw error;
    }
  }

  async resetPasswordWithCode(
    userId: string,
    secret: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await account.updateRecovery(userId, secret, newPassword);
    } catch (error) {
      console.error("Error resetting password with code:", error);
      throw error;
    }
  }
}

export const authService: AuthService = new AppwriteAuthService();
