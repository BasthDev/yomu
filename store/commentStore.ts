import { create } from 'zustand';
import * as Database from '../utils/database';

const USER_ID = 'user_1'; // In production, this would come from auth

interface CommentState {
  comments: Database.Comment[];
  isLoading: boolean;
  loadComments: (chapterId: string) => Promise<void>;
  addComment: (chapterId: string, content: string) => Promise<void>;
  likeComment: (commentId: number) => Promise<void>;
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
      console.error('Error loading comments:', error);
      set({ isLoading: false });
    }
  },

  addComment: async (chapterId: string, content: string) => {
    try {
      await Database.addComment(chapterId, USER_ID, content);
      await get().loadComments(chapterId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  },

  likeComment: async (commentId: number) => {
    try {
      await Database.likeComment(commentId);
      // Update local state
      set({
        comments: get().comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes_count: comment.likes_count + 1 }
            : comment
        ),
      });
    } catch (error) {
      console.error('Error liking comment:', error);
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
      console.error('Error deleting comment:', error);
    }
  },
}));
