import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BookListRow } from "../../components/BookListRow";
import { Container } from "../../components/Container";
import { CustomHeader } from "../../components/Header";
import {
    useAllBooks,
    useBookCommentCounts,
} from "../../hooks/queries/useBooks";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useThemeStore } from "../../store/themeStore";
import {
    BookSortKey,
    filterAndSortBooks,
    getAllGenres,
    SORT_OPTIONS,
} from "../../utils/bookFilters";
import { BookItem } from "../../utils/books";
import { navigateToBook } from "../../utils/navigation";

export default function Browse() {
  const router = useRouter();
  const { currentTheme } = useThemeStore();
  const { data: books = [], isLoading } = useAllBooks();
  const { data: commentCounts = {} } = useBookCommentCounts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<BookSortKey>("views");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const genres = useMemo(() => getAllGenres(books), [books]);

  const filteredBooks = useMemo(
    () =>
      filterAndSortBooks(
        books,
        { query: debouncedQuery, genre: selectedGenre, sort },
        commentCounts,
      ),
    [books, debouncedQuery, selectedGenre, sort, commentCounts],
  );

  const handleBookPress = (book: BookItem) => {
    navigateToBook(router, book.id);
  };

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Sort";

  return (
    <Container>
      <CustomHeader
        title="Browse"
        // showBack
        // onBack={() => router.back()}
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setSortModalVisible(true)}
      />

      <View style={styles.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreRow}
        >
          <Pressable
            style={[
              styles.genreChip,
              {
                backgroundColor: !selectedGenre
                  ? currentTheme.primary
                  : currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={() => setSelectedGenre(null)}
          >
            <Text
              style={[
                styles.genreChipText,
                { color: !selectedGenre ? "#fff" : currentTheme.text },
              ]}
            >
              All
            </Text>
          </Pressable>
          {genres.map((genre) => {
            const active = selectedGenre === genre;
            return (
              <Pressable
                key={genre}
                style={[
                  styles.genreChip,
                  {
                    backgroundColor: active
                      ? currentTheme.primary
                      : currentTheme.surface,
                    borderColor: currentTheme.border,
                  },
                ]}
                onPress={() => setSelectedGenre(active ? null : genre)}
              >
                <Text
                  style={[
                    styles.genreChipText,
                    { color: active ? "#fff" : currentTheme.text },
                  ]}
                >
                  {genre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={currentTheme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookListRow
              book={item}
              commentCount={commentCounts[item.id] ?? 0}
              onPress={handleBookPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: currentTheme.textSecondary }}>
                No novels found
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSortModalVisible(false)}
        >
          <View
            style={[
              styles.sortModal,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Text style={[styles.sortModalTitle, { color: currentTheme.text }]}>
              Sort by
            </Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.sortOption}
                onPress={() => {
                  setSort(option.key);
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    {
                      color:
                        sort === option.key
                          ? currentTheme.primary
                          : currentTheme.text,
                      fontWeight: sort === option.key ? "700" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {sort === option.key && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={currentTheme.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  genreRow: {
    gap: 8,
    paddingVertical: 4,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sortModal: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 32,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  sortOptionText: {
    fontSize: 15,
  },
});
