import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BookGridCard } from "../../components/Card";
import { Container } from "../../components/Container";
import { CustomHeader } from "../../components/Header";
import { HeroSlider } from "../../components/HeroSlider";
import { useAllBooks } from "../../hooks/queries/useBooks";
import { useBookRatingsStore } from "../../store/bookRatingsStore";
import { useThemeStore } from "../../store/themeStore";
import { BookItem } from "../../utils/books";
import { getPopularBooks } from "../../utils/bookFilters";
import { navigateToBook } from "../../utils/navigation";

export default function Index() {
  const { currentTheme } = useThemeStore();
  const loadAllRatings = useBookRatingsStore((state) => state.loadAllRatings);
  const { data: allBooks = [] } = useAllBooks();

  const hotBooks = useMemo(
    () => allBooks.filter((book) => book.isHot),
    [allBooks],
  );
  const popularBooks = useMemo(
    () => getPopularBooks(allBooks, 8),
    [allBooks],
  );

  useEffect(() => {
    if (allBooks.length === 0) return;
    const bookIds = allBooks.map((book) => book.id);
    loadAllRatings(bookIds);
  }, [allBooks, loadAllRatings]);

  const handleBookPress = (item: BookItem) => {
    navigateToBook(router, item.id);
  };

  const renderHeader = () => (
    <View>
      <HeroSlider data={hotBooks} onPress={handleBookPress} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primary }]}>
          POPULAR BOOKS
        </Text>
        <Pressable onPress={() => router.push("/browse")}>
          <Text style={[styles.seeAll, { color: currentTheme.textSecondary }]}>
            See all →
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Container>
      <CustomHeader />

      <FlatList
        data={popularBooks}
        renderItem={({ item }) => (
          <BookGridCard item={item} onPress={handleBookPress} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: currentTheme.background },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 60,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: "Audiowide_400Regular",
    color: "#ffffff",
    fontSize: 18,
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
});
