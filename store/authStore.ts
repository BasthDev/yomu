import { useAuth, useUser } from "@clerk/expo";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import * as Database from "../utils/database";
import { getDisplayName } from "../utils/userDisplayName";

interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  setUserId: (userId: string) => void;
  setUserData: (
    firstName: string,
    lastName: string,
    email: string,
    imageUrl: string,
  ) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: "", // Will be set from Clerk
  firstName: "",
  lastName: "",
  email: "",
  imageUrl: "",

  setUserId: (userId: string) => {
    set({ isAuthenticated: true, userId });
  },

  setUserData: (
    firstName: string,
    lastName: string,
    email: string,
    imageUrl: string,
  ) => {
    set({ firstName, lastName, email, imageUrl });
  },

  logout: async () => {
    // Clerk handles logout via useAuth hook
    set({
      isAuthenticated: false,
      userId: "",
      firstName: "",
      lastName: "",
      email: "",
      imageUrl: "",
    });
  },
}));

// Hook to sync Clerk auth state with our store
export const useClerkAuthSync = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const setUserId = useAuthStore((s) => s.setUserId);
  const setUserData = useAuthStore((s) => s.setUserData);
  const prevDisplayNameRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      setUserId(userId);
    }
  }, [isLoaded, isSignedIn, userId, setUserId]);

  useEffect(() => {
    if (!user || !userId) return;

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const displayName = getDisplayName(firstName, lastName);

    setUserData(
      firstName,
      lastName,
      user.emailAddresses[0]?.emailAddress || "",
      user.imageUrl || "",
    );

    if (displayName && displayName !== prevDisplayNameRef.current) {
      prevDisplayNameRef.current = displayName;
      Database.updateCommentDisplayNames(userId, displayName).catch((err) =>
        console.error("Failed to backfill comment display names:", err),
      );
    }
  }, [user, userId, setUserData]);
};
