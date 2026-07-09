import { BookListRow } from "@/components/BookListRow";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useThemeStore } from "../../store/themeStore";
import { DUMMY_BOOKS } from "../../utils/dummyData";
import { navigateToBook } from "../../utils/navigation";

export default function Bookmark() {
  const router = useRouter();
  const { bookmarkedIds, removeBookmark, loadData, isLoading } =
    useBookmarkStore();
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    loadData();
  }, []);

  const bookmarkedBooks = DUMMY_BOOKS.filter((book) =>
    bookmarkedIds.includes(book.id),
  );

  const handleBookPress = (bookId: string) => {
    navigateToBook(router, bookId);
  };

  return (
    <Container>
      <CustomHeader title="My Bookmarks" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ContentWithPadding style={styles.content}>
          {bookmarkedBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={64}
                color={currentTheme.textSecondary}
              />
              <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                No bookmarks yet
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Start adding books to your bookmarks!
              </Text>
            </View>
          ) : (
            <View style={styles.bookList}>
              {bookmarkedBooks.map((book) => (
                <BookListRow
                  key={book.id}
                  book={book}
                  rightContent={
                    <Ionicons
                      name="bookmark"
                      size={18}
                      color={currentTheme.primary}
                    />
                  }
                  onPress={() => handleBookPress(book.id)}
                />
              ))}
            </View>
          )}
        </ContentWithPadding>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  bookList: {
    gap: 12,
  },
});
