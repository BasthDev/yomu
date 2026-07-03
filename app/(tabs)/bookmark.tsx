import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useBookRatingsStore } from "../../store/bookRatingsStore";
import { useThemeStore } from "../../store/themeStore";
import { DUMMY_BOOKS } from "../../utils/dummyData";
import { navigateToBook } from "../../utils/navigation";

export default function Bookmark() {
  const router = useRouter();
  const { bookmarkedIds, removeBookmark, loadData, isLoading } =
    useBookmarkStore();
  const { currentTheme } = useThemeStore();
  const getRating = useBookRatingsStore((state) => state.getRating);

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
              {bookmarkedBooks.map((book) => {
                const rating = getRating(book.id);
                return (
                  <Pressable
                    key={book.id}
                    style={[
                      styles.bookCard,
                      {
                        backgroundColor: currentTheme.surface,
                        borderColor: currentTheme.border,
                      },
                    ]}
                    onPress={() => handleBookPress(book.id)}
                  >
                    <Image
                      source={{ uri: book.cover }}
                      style={styles.bookCover}
                      resizeMode="cover"
                    />

                    <View style={styles.bookInfo}>
                      <Text
                        style={[styles.bookTitle, { color: currentTheme.text }]}
                        numberOfLines={2}
                      >
                        {book.title}
                      </Text>
                      <Text
                        style={[
                          styles.bookAuthor,
                          { color: currentTheme.textSecondary },
                        ]}
                      >
                        {book.author}
                      </Text>

                      <View style={styles.bookMeta}>
                        <View style={styles.ratingBox}>
                          <Ionicons name="star" size={12} color="#ffcc00" />
                          <Text
                            style={[
                              styles.ratingText,
                              { color: currentTheme.text },
                            ]}
                          >
                            {rating.toFixed(1)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: currentTheme.primary + "20" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: currentTheme.primary },
                            ]}
                          >
                            {book.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeBookmark(book.id)}
                    >
                      <Ionicons
                        name="bookmark"
                        size={20}
                        color={currentTheme.primary}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
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
  bookCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
  },
  bookCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  removeButton: {
    padding: 8,
  },
});
