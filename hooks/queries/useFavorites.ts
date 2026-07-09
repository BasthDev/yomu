import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Favorite, favoriteRepository } from "../../services";

export const useFavorites = (userId: string) => {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => favoriteRepository.getFavoritesByUser(userId),
    enabled: !!userId,
  });
};

export const useIsFavorite = (userId: string, novelId: string) => {
  return useQuery({
    queryKey: ["favorite", userId, novelId],
    queryFn: () => favoriteRepository.isFavorite(userId, novelId),
    enabled: !!userId && !!novelId,
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Favorite>) =>
      favoriteRepository.addFavorite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favorites", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["favorite", variables.userId, variables.novelId],
      });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => favoriteRepository.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};
