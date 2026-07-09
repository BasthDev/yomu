import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, bookmarkRepository } from "../../services";

export const useBookmarks = (userId: string) => {
  return useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: () => bookmarkRepository.getBookmarksByUser(userId),
    enabled: !!userId,
  });
};

export const useBookmark = (userId: string, novelId: string) => {
  return useQuery({
    queryKey: ["bookmark", userId, novelId],
    queryFn: () => bookmarkRepository.getBookmark(userId, novelId),
    enabled: !!userId && !!novelId,
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Bookmark>) =>
      bookmarkRepository.createBookmark(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", variables.userId],
      });
    },
  });
};

export const useUpdateBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bookmark> }) =>
      bookmarkRepository.updateBookmark(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarkRepository.deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
};
