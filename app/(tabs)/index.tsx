import { router } from "expo-router";
import { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { BookGridCard } from "../../components/Card";
import { Container } from "../../components/Container";
import { CustomHeader } from "../../components/Header";
import { HeroSlider } from "../../components/HeroSlider";
import { useBookRatingsStore } from "../../store/bookRatingsStore";
import { useThemeStore } from "../../store/themeStore";
import { BookItem } from "../../utils/books";
import { DUMMY_BOOKS } from "../../utils/dummyData";
import { navigateToBook } from "../../utils/navigation";

export default function Index() {
  const { currentTheme } = useThemeStore();
  const loadAllRatings = useBookRatingsStore((state) => state.loadAllRatings);
  const ratings = useBookRatingsStore((state) => state.ratings);

  useEffect(() => {
    const bookIds = DUMMY_BOOKS.map((book) => book.id);
    loadAllRatings(bookIds);
  }, [loadAllRatings]);

  const handleBookPress = (item: BookItem) => {
    navigateToBook(router, item.id);
  };

  // Komponen header di atas grid
  const renderHeader = () => (
    <View>
      {/* 1. Slider sekarang berada di luar komponen padding sehingga bisa tampil penuh (edge-to-edge) */}
      <HeroSlider
        data={DUMMY_BOOKS.filter((book) => book.isHot)}
        onPress={handleBookPress}
      />

      {/* 2. Berikan padding horizontal khusus untuk area judul seksi saja */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentTheme.primary }]}>
          POPULAR BOOKS
        </Text>
      </View>
    </View>
  );

  return (
    <Container>
      <CustomHeader />

      {/* 
        3. PERBAIKAN UTAMA: Mengeluarkan FlatList dari <ContentWithPadding>.
        Kita menggunakan contentContainerStyle langsung pada FlatList untuk memberi padding 
        pada daftar buku di bawah tanpa memengaruhi Slider atas.
      */}
      <FlatList
        data={DUMMY_BOOKS}
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
    paddingBottom: 60, // Jarak ekstra di bawah agar tidak terpotong tab bar bawah
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16, // Jarak vertikal antar baris kartu grid novel
    paddingHorizontal: 16, // 4. Memberikan padding sisi kanan-kiri khusus untuk kartu grid saja
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16, // 5. Memberikan padding sisi kanan-kiri khusus untuk teks judul seksi
  },
  sectionTitle: {
    fontFamily: "Audiowide_400Regular",
    color: "#ffffff",
    fontSize: 18,
    letterSpacing: 1,
  },
});
