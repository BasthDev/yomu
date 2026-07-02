import { Router } from "expo-router";

export function navigateToRead(router: Router, chapterId: string) {
  router.push({
    pathname: "/read/[chapterId]",
    params: { chapterId },
  } as never);
}

export function navigateToBook(router: Router, bookId: string) {
  router.push({
    pathname: "/book/[id]",
    params: { id: bookId },
  } as never);
}

export function navigateToComments(router: Router, chapterId: string) {
  router.push({
    pathname: "/comments/[chapterId]",
    params: { chapterId },
  } as never);
}

export function navigateToWallet(router: Router) {
  router.push("/(tabs)/wallet" as never);
}
