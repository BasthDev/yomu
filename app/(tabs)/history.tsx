import { BookListRow } from "@/components/BookListRow";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { CustomHeader } from "../../components/Header";
import { useSecurity } from "../../context/SecurityContext";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useThemeStore } from "../../store/themeStore";
import { DUMMY_BOOKS } from "../../utils/dummyData";
import { navigateToBook, navigateToRead } from "../../utils/navigation";

export default function History() {
  const router = useRouter();
  const { readingHistory, clearReadingHistory, loadData } = useBookmarkStore();
  const { currentTheme } = useThemeStore();
  const { checkAccess } = useSecurity();

  useEffect(() => {
    loadData();
  }, []);

  const handleBookPress = (bookId: string) => {
    navigateToBook(router, bookId);
  };

  const handleContinueReading = async (historyItem: any) => {
    const book = DUMMY_BOOKS.find((b) => b.id === historyItem.bookId);
    const chapter = book?.chaptersList?.find(
      (ch) => ch.id === historyItem.chapterId,
    );

    if (!book || !chapter) {
      navigateToBook(router, historyItem.bookId);
      return;
    }

    const access = await checkAccess(book, chapter);
    if (access.canAccess) {
      navigateToRead(router, historyItem.chapterId);
    } else {
      navigateToBook(router, historyItem.bookId);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Container>
      <CustomHeader title="Reading History" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ContentWithPadding style={styles.content}>
          {readingHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="time-outline"
                size={64}
                color={currentTheme.textSecondary}
              />
              <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                No reading history yet
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Start reading to track your progress!
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.historyCount,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  {readingHistory.length}{" "}
                  {readingHistory.length === 1 ? "book" : "books"}
                </Text>
                <Pressable
                  onPress={clearReadingHistory}
                  style={[
                    styles.clearButton,
                    { borderColor: currentTheme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.clearButtonText,
                      { color: currentTheme.primary },
                    ]}
                  >
                    Clear All
                  </Text>
                </Pressable>
              </View>

              <View style={styles.historyList}>
                {readingHistory.map((historyItem) => {
                  const book = DUMMY_BOOKS.find(
                    (b) => b.id === historyItem.bookId,
                  );
                  if (!book) return null;

                  return (
                    <BookListRow
                      key={historyItem.bookId}
                      book={book}
                      subtitle={`${book.author} · ${book.genre.join(", ")}`}
                      customStats={
                        <View style={styles.stats}>
                          <View style={styles.stat}>
                            <Ionicons
                              name="book-outline"
                              size={12}
                              color={currentTheme.textSecondary}
                            />
                            <Text
                              style={[
                                styles.statText,
                                { color: currentTheme.textSecondary },
                              ]}
                            >
                              Ch. {historyItem.chapterNumber}
                            </Text>
                          </View>
                          <View style={styles.stat}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={currentTheme.textSecondary}
                            />
                            <Text
                              style={[
                                styles.statText,
                                { color: currentTheme.textSecondary },
                              ]}
                            >
                              {formatTimeAgo(historyItem.lastReadAt)}
                            </Text>
                          </View>
                        </View>
                      }
                      onPress={() => handleBookPress(historyItem.bookId)}
                    />
                  );
                })}
              </View>
            </>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyCount: {
    fontSize: 14,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  historyList: {
    gap: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 11,
  },
});
