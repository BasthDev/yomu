import { useAuth, useUser } from "@clerk/expo";
import { useEffect } from "react";
import { create } from "zustand";

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

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      setUserId(userId);
    }
  }, [isLoaded, isSignedIn, userId, setUserId]);

  useEffect(() => {
    if (user) {
      setUserData(
        user.firstName || "",
        user.lastName || "",
        user.emailAddresses[0]?.emailAddress || "",
        user.imageUrl || "",
      );
    }
  }, [user, setUserData]);
};
