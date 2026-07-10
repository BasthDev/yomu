import { useEffect } from "react";
import { create } from "zustand";
import { authService } from "../services/appwrite/auth";
import * as Database from "../utils/database";
import { getDisplayName } from "../utils/userDisplayName";

interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  isLoading: boolean;
  setUserId: (userId: string) => void;
  setUserData: (
    firstName: string,
    lastName: string,
    email: string,
    imageUrl: string,
  ) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  imageUrl: "",
  isLoading: true,

  setUserId: (userId: string) => {
    set({ isAuthenticated: true, userId });
  },

  setUserData: (
    firstName: string,
    lastName: string,
    email: string,
    imageUrl: string,
  ) => {
    set({ firstName, lastName, email, imageUrl, isLoading: false });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  logout: async () => {
    try {
      await authService.signOut();
      set({
        isAuthenticated: false,
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        imageUrl: "",
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  checkAuth: async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const firstName = user.name?.split(" ")[0] || "";
        const lastName = user.name?.split(" ").slice(1).join(" ") || "";
        const email = user.email || "";

        set({
          isAuthenticated: true,
          userId: user.$id,
          firstName,
          lastName,
          email,
          imageUrl: "",
          isLoading: false,
        });

        // Backfill comment display names
        const displayName = getDisplayName(firstName, lastName);
        if (displayName) {
          Database.updateCommentDisplayNames(user.$id, displayName).catch(
            (err) =>
              console.error("Failed to backfill comment display names:", err),
          );
        }
      } else {
        set({
          isAuthenticated: false,
          userId: "",
          firstName: "",
          lastName: "",
          email: "",
          imageUrl: "",
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        imageUrl: "",
        isLoading: false,
      });
    }
  },
}));

// Hook to check auth on mount
export const useAppwriteAuthSync = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isLoading };
};
