import { useAuthStore } from "../store/authStore";

export function getAuthUserId(): string {
  const userId = useAuthStore.getState().userId;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export function getAuthUserIdOrNull(): string | null {
  return useAuthStore.getState().userId || null;
}
