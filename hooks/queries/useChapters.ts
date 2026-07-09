import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chapter, chapterRepository } from "../../services";

export const useChaptersByNovel = (novelId: string) => {
  return useQuery({
    queryKey: ["chapters", "by-novel", novelId],
    queryFn: () => chapterRepository.getChaptersByNovel(novelId),
    enabled: !!novelId,
  });
};

export const useChapter = (id: string) => {
  return useQuery({
    queryKey: ["chapter", id],
    queryFn: () => chapterRepository.getChapterById(id),
    enabled: !!id,
  });
};

export const useChapterByNumber = (novelId: string, chapterNumber: number) => {
  return useQuery({
    queryKey: ["chapter", "by-number", novelId, chapterNumber],
    queryFn: () => chapterRepository.getChapterByNumber(novelId, chapterNumber),
    enabled: !!novelId && !!chapterNumber,
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Chapter>) =>
      chapterRepository.createChapter(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chapters", "by-novel", variables.novelId],
      });
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Chapter> }) =>
      chapterRepository.updateChapter(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapter", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chapterRepository.deleteChapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};
