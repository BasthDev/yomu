import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  setUserId: (userId: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: "", // Will be set from Clerk

  setUserId: (userId: string) => {
    set({ isAuthenticated: true, userId });
  },

  logout: async () => {
    // Clerk handles logout via useAuth hook
    set({ isAuthenticated: false, userId: "" });
  },
}));

// Hook to sync Clerk auth state with our store
export const useClerkAuthSync = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const setUserId = useAuthStore((s) => s.setUserId);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      setUserId(userId);
    }
  }, [isLoaded, isSignedIn, userId, setUserId]);
};
