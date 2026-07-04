import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import { bookRepository } from "../../services/repositories/bookRepository";

export function useAllBooks() {
  return useQuery({
    queryKey: queryKeys.books.all,
    queryFn: () => bookRepository.getAllBooks(),
    staleTime: 5 * 60_000,
  });
}

export function useBookCommentCounts() {
  return useQuery({
    queryKey: queryKeys.books.commentCounts,
    queryFn: () => bookRepository.getCommentCountsByBook(),
    staleTime: 30_000,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => bookRepository.getBookById(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });
}
