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
import { useThemeStore } from "../../store/themeStore";
import { DUMMY_BOOKS } from "../../utils/dummyData";

export default function History() {
  const router = useRouter();
  const { readingHistory, clearReadingHistory, loadData } = useBookmarkStore();
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    loadData();
  }, []);

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}` as any);
  };

  const handleContinueReading = (historyItem: any) => {
    router.push(`/read/${historyItem.chapterId}` as any);
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
              <Ionicons name="time-outline" size={64} color="#333" />
              <Text style={styles.emptyText}>No reading history yet</Text>
              <Text style={styles.emptySubtext}>
                Start reading to track your progress!
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.headerRow}>
                <Text
                  style={[styles.historyCount, { color: currentTheme.text }]}
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
                      { color: currentTheme.textSecondary },
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
                    <Pressable
                      key={historyItem.bookId}
                      style={styles.historyCard}
                      onPress={() => handleBookPress(historyItem.bookId)}
                    >
                      <Image
                        source={{ uri: book.cover }}
                        style={styles.bookCover}
                        resizeMode="cover"
                      />

                      <View style={styles.bookInfo}>
                        <Text style={styles.bookTitle} numberOfLines={2}>
                          {book.title}
                        </Text>
                        <Text style={styles.bookAuthor}>{book.author}</Text>

                        <View style={styles.chapterInfo}>
                          <Text
                            style={[
                              styles.chapterText,
                              {
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                color: currentTheme.primary,
                              },
                            ]}
                          >
                            <Ionicons
                              name="book"
                              size={14}
                              color={currentTheme.primary}
                            />{" "}
                            Chapter {historyItem.chapterNumber}
                          </Text>
                          <Text
                            style={[
                              styles.chapterText,
                              { color: currentTheme.textSecondary },
                            ]}
                          >
                            {historyItem.chapterTitle}
                          </Text>
                        </View>

                        <Text style={styles.timeText}>
                          {formatTimeAgo(historyItem.lastReadAt)}
                        </Text>
                      </View>

                      <Pressable
                        style={[
                          styles.continueButton,
                          { backgroundColor: currentTheme.primary },
                        ]}
                        onPress={() => handleContinueReading(historyItem)}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#fff"
                        />
                      </Pressable>
                    </Pressable>
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
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
    color: "#888",
    fontSize: 14,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: "#E50914",
    fontSize: 14,
    fontWeight: "600",
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    color: "#888",
    fontSize: 13,
    marginBottom: 8,
  },
  chapterInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  chapterText: {
    color: "#E50914",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  timeText: {
    color: "#666",
    fontSize: 11,
  },
  continueButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
