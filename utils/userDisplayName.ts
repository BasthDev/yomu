import { useAuthStore } from "../store/authStore";

export function getDisplayName(
  firstName: string,
  lastName: string,
): string | null {
  const name = `${firstName} ${lastName}`.trim();
  return name || null;
}

export function getAuthDisplayName(): string | null {
  const { firstName, lastName } = useAuthStore.getState();
  return getDisplayName(firstName, lastName);
}

export function resolveCommentAuthor(
  comment: { user_id: string; display_name?: string | null },
  currentUserId: string | null,
): string {
  if (
    currentUserId &&
    comment.user_id === currentUserId
  ) {
    const liveName = getAuthDisplayName();
    if (liveName) return liveName;
  }

  if (comment.display_name) {
    return comment.display_name;
  }

  return "Reader";
}
