import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Novel, novelRepository } from "../../services";

export const useNovels = () => {
  return useQuery({
    queryKey: ["novels"],
    queryFn: () => novelRepository.getAllNovels(),
  });
};

export const useNovel = (id: string) => {
  return useQuery({
    queryKey: ["novel", id],
    queryFn: () => novelRepository.getNovelById(id),
    enabled: !!id,
  });
};

export const useNovelsByAuthor = (authorId: string) => {
  return useQuery({
    queryKey: ["novels", "by-author", authorId],
    queryFn: () => novelRepository.getNovelsByAuthor(authorId),
    enabled: !!authorId,
  });
};

export const useSearchNovels = (query: string) => {
  return useQuery({
    queryKey: ["novels", "search", query],
    queryFn: () => novelRepository.searchNovels(query),
    enabled: query.length > 0,
  });
};

export const useCreateNovel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Novel>) => novelRepository.createNovel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["novels"] });
    },
  });
};

export const useUpdateNovel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Novel> }) =>
      novelRepository.updateNovel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["novels"] });
      queryClient.invalidateQueries({ queryKey: ["novel", variables.id] });
    },
  });
};

export const useDeleteNovel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => novelRepository.deleteNovel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["novels"] });
    },
  });
};
