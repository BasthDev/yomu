import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Container } from "../../../components/Container";
import { ContentWithPadding } from "../../../components/Content"; // Komponen Anda yang sudah mendukung extra style
import { useBookmarkStore } from "../../../store/bookmarkStore";
import { DUMMY_BOOKS } from "../../../utils/dummyData";

const { width, height } = Dimensions.get("window");
const BANNER_HEIGHT = 380; // Mengunci tinggi gambar banner atas

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [showBackButton, setShowBackButton] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark, loadData } =
    useBookmarkStore();
  const { currentTheme } = useThemeStore();

  const book = DUMMY_BOOKS.find((b) => b.id === id);

  useEffect(() => {
    loadData();
  }, []);

  const toggleBookmark = async () => {
    setIsSaving(true);
    try {
      if (isBookmarked(id as string)) {
        await removeBookmark(id as string);
      } else {
        await addBookmark(id as string);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!book) {
    return (
      <Container>
        <View style={styles.centered}>
          <Text style={{ color: "#fff" }}>Novel tidak ditemukan.</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* HEADER NAVIGASI FLOATING */}
      <View style={styles.topNavigation}>
        <View style={styles.topNavLeft}>
          {showBackButton && (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
          )}
        </View>
        {showBackButton && (
          <Pressable
            onPress={toggleBookmark}
            style={styles.bookmarkButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <Ionicons name="time" size={24} color="#888" />
            ) : (
              <Ionicons
                name={
                  isBookmarked(id as string) ? "bookmark" : "bookmark-outline"
                }
                size={24}
                color={
                  isBookmarked(id as string) ? currentTheme.primary : "#fff"
                }
              />
            )}
          </Pressable>
        )}
      </View>

      {/* GAMBAR BANNER STATIS (Sudah TIDAK menggunakan komponen Animated) */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: book.banner }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(18, 18, 18, 0.1)", "rgba(18, 18, 18, 0.5)", "#121212"]}
          locations={[0, 0.6, 1]}
          style={styles.gradientOverlay}
        />
      </View>

      {/* AREA SCROLL UTAMA */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setShowBackButton(scrollY < 150);
        }}
        scrollEventThrottle={16}
      >
        {/* SPACER: Penahan tinggi statis agar konten kartu di bawah tidak menutupi gambar banner saat pertama dibuka */}
        <View style={styles.headerSpacer} />

        {/* LEMBARAN KONTEN UTAMA (Menggunakan komponen ContentWithPadding kustom Anda) */}
        <ContentWithPadding style={styles.mainContent}>
          {/* INFO BUKU UTAMA */}
          <View style={styles.metaRow}>
            <View style={styles.badgeHot}>
              <Text style={styles.badgeText}>{book.status.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#ffcc00" />
              <Text style={styles.ratingText}>{book.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>Author: {book.author}</Text>

          {/* GENRE LIST */}
          <View style={styles.genreContainer}>
            {book.genre.map((g, idx) => (
              <View key={idx} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{g}</Text>
              </View>
            ))}
          </View>

          {/* SINOPSIS / DESKRIPSI */}
          <Text style={styles.sectionTitle}>SINOPSIS</Text>
          <Text style={styles.description}>{book.description}</Text>

          {/* DAFTAR EPISODE / CHAPTER LIST */}
          <Text style={styles.sectionTitle}>DAFTAR CHAPTER</Text>

          <View style={styles.episodeListContainer}>
            {book.chaptersList && book.chaptersList.length > 0 ? (
              book.chaptersList.map((chapter) => (
                <Pressable
                  key={chapter.id}
                  style={styles.episodeCard}
                  // PERBAIKAN: Mengirim parameter ID chapter secara dinamis ke halaman baca
                  onPress={() => router.push(`/read/${chapter.id}` as any)}
                >
                  <View style={styles.episodeLeft}>
                    <View style={styles.episodeIconBox}>
                      <Ionicons name="book" size={18} color="red" />
                    </View>
                    <View style={styles.episodeMeta}>
                      <Text style={styles.episodeNumber}>
                        Chapter {chapter.chapterNumber}
                      </Text>
                      <Text style={styles.episodeTitle} numberOfLines={1}>
                        {chapter.title}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#666" />
                </Pressable>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Belum ada episode yang dirilis.
              </Text>
            )}
          </View>
        </ContentWithPadding>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  topNavigation: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topNavLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Container Banner Statis: Diposisikan absolute di latar belakang paling belakang
  bannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: width,
    height: BANNER_HEIGHT,
    zIndex: 1,
  },
  bannerImage: { width: "100%", height: "100%" },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },

  // Kontrol Scroll Layar Utama
  scrollView: {
    flex: 1,
    zIndex: 2, // Menempatkan area scroll di atas area banner container latar belakang
  },
  scrollContent: {
    paddingBottom: 60, // Padding ekstra paling ujung bawah agar daftar episode tidak menempel navigasi ponsel
  },
  headerSpacer: {
    height: BANNER_HEIGHT - 30, // Dikurangi 30 agar lengkungan lengkung atas menimpa anggun di atas gradien banner
  },
  mainContent: {
    backgroundColor: "#121212", // Latar belakang gelap padat Yomu
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    minHeight: height - 120, // Memaksa komponen kustom Anda terus memanjang lurus ke bawah tanpa batas mengambang
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  badgeHot: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  title: {
    fontFamily: "Audiowide_400Regular",
    color: "#fff",
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 6,
  },
  author: { color: "#888", fontSize: 14, marginBottom: 16 },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 28,
  },
  genreTag: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  genreTagText: { color: "#ccc", fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontFamily: "Audiowide_400Regular",
    color: "#fff",
    fontSize: 16,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 14,
  },
  description: {
    color: "#aaa",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 30,
  },
  episodeListContainer: { gap: 10 },
  episodeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
  },
  episodeLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  episodeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeMeta: { flex: 1, gap: 2 },
  episodeNumber: {
    color: "red",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  episodeTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  emptyText: {
    color: "#555",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
});
