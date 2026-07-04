import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Database from "../utils/database";
import { queryKeys } from "../services/queryKeys";

export function useChapterComments(chapterId: string) {
  return useQuery({
    queryKey: queryKeys.comments.chapter(chapterId),
    queryFn: () => Database.getCommentsWithReplies(chapterId),
    enabled: !!chapterId,
    staleTime: 30_000,
  });
}

export function useInvalidateComments() {
  const queryClient = useQueryClient();
  return (chapterId: string) =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.comments.chapter(chapterId),
    });
}
