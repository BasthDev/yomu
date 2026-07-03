import { create } from "zustand";
import * as Database from "../utils/database";
import { useAuthStore } from "./authStore";

interface CommentState {
  comments: Database.Comment[];
  isLoading: boolean;
  loadComments: (chapterId: string) => Promise<void>;
  loadCommentsWithReplies: (chapterId: string) => Promise<Database.Comment[]>;
  addComment: (
    chapterId: string,
    content: string,
    parentCommentId?: number | null,
  ) => Promise<void>;
  likeComment: (commentId: number) => Promise<boolean>;
  hasUserLikedComment: (commentId: number) => Promise<boolean>;
  deleteComment: (commentId: number) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,

  loadComments: async (chapterId: string) => {
    try {
      set({ isLoading: true });
      const comments = await Database.getComments(chapterId);
      set({ comments, isLoading: false });
    } catch (error) {
      console.error("Error loading comments:", error);
      set({ isLoading: false });
    }
  },

  loadCommentsWithReplies: async (chapterId: string) => {
    try {
      set({ isLoading: true });
      const comments = await Database.getCommentsWithReplies(chapterId);
      set({ comments: comments as any, isLoading: false });
      return comments;
    } catch (error) {
      console.error("Error loading comments with replies:", error);
      set({ isLoading: false });
      return [];
    }
  },

  addComment: async (
    chapterId: string,
    content: string,
    parentCommentId: number | null = null,
  ) => {
    try {
      const userId = useAuthStore.getState().userId || "user_1";
      await Database.addComment(chapterId, userId, content, parentCommentId);
      await get().loadCommentsWithReplies(chapterId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  },

  likeComment: async (commentId: number) => {
    try {
      const userId = useAuthStore.getState().userId || "user_1";
      const liked = await Database.likeComment(commentId, userId);

      // Update local state
      set({
        comments: get().comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: comment.likes_count + (liked ? 1 : -1),
            };
          }
          // Also update replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      likes_count: reply.likes_count + (liked ? 1 : -1),
                    }
                  : reply,
              ),
            };
          }
          return comment;
        }),
      });

      return liked;
    } catch (error) {
      console.error("Error liking comment:", error);
      return false;
    }
  },

  hasUserLikedComment: async (commentId: number) => {
    try {
      const userId = useAuthStore.getState().userId || "user_1";
      return await Database.hasUserLikedComment(commentId, userId);
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  },

  deleteComment: async (commentId: number) => {
    try {
      await Database.deleteComment(commentId);
      // Update local state
      set({
        comments: get().comments.filter((comment) => comment.id !== commentId),
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  },
}));
