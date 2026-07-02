import { ChapterNavigation } from "@/components/ChapterNavigation";
import { Container } from "@/components/Container";
import { ContentWithPadding } from "@/components/Content";
import { CustomHeader } from "@/components/Header";
import { useThemeStore } from "@/store/themeStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useBookmarkStore } from "../../../store/bookmarkStore";
import { DUMMY_BOOKS } from "../../../utils/dummyData"; // Sesuaikan path jika berbeda

export default function Read() {
  const { chapterId } = useLocalSearchParams();
  const router = useRouter();
  const { updateReadingHistory } = useBookmarkStore();
  const { currentTheme } = useThemeStore();

  // 1. Cari buku dan bab yang cocok di dalam database data buatan (DUMMY_BOOKS)
  let currentBook: any = null;
  let currentChapter: any = null;
  let currentChapterIndex = -1;

  for (const book of DUMMY_BOOKS) {
    if (book.chaptersList) {
      const index = book.chaptersList.findIndex((ch) => ch.id === chapterId);
      if (index !== -1) {
        currentBook = book;
        currentChapter = book.chaptersList[index];
        currentChapterIndex = index;
        break;
      }
    }
  }

  // Save reading history when chapter is opened
  useEffect(() => {
    if (currentBook && currentChapter) {
      updateReadingHistory(
        currentBook.id,
        currentChapter.id,
        currentChapter.chapterNumber,
        currentChapter.title,
      );
    }
  }, [currentBook, currentChapter, updateReadingHistory]);

  // Pengondisian jika parameter ID bab tidak ditemukan
  if (!currentBook || !currentChapter) {
    return (
      <Container>
        <CustomHeader showBack onBack={() => router.back()} />
        <View style={styles.centered}>
          <Text style={{ color: "#fff" }}>Konten bab tidak ditemukan.</Text>
        </View>
      </Container>
    );
  }

  // 2. Tentukan status batasan navigasi (Prev / Next)
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentBook.chaptersList
    ? currentChapterIndex < currentBook.chaptersList.length - 1
    : false;

  const handlePrevChapter = () => {
    if (hasPrev && currentBook.chaptersList) {
      const prevChapterId =
        currentBook.chaptersList[currentChapterIndex - 1].id;
      // Gunakan replace agar riwayat tumpukan tetap bersih
      router.replace(`/read/${prevChapterId}` as any);
    }
  };

  const handleNextChapter = () => {
    if (hasNext && currentBook.chaptersList) {
      const nextChapterId =
        currentBook.chaptersList[currentChapterIndex + 1].id;
      router.replace(`/read/${nextChapterId}` as any);
    }
  };

  // 3. KUNCINYA DI SINI: Paksa navigasi melompat langsung ke halaman detail buku asalnya
  const handleGoBackToBook = () => {
    router.back();
  };

  return (
    <Container>
      {/* 4. Terapkan fungsi absolut kembali ke buku pada properti onBack */}
      <CustomHeader
        title={`Eps ${currentChapter.chapterNumber}: ${currentChapter.title}`}
        showBack
        onBack={handleGoBackToBook}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ContentWithPadding>
          <View style={styles.novelContainer}>
            {/* Judul Chapter Dinamis */}
            <Text
              style={[styles.chapterTitle, { color: currentTheme.primary }]}
            >
              CHAPTER {currentChapter.chapterNumber}
            </Text>
            <Text
              style={[styles.chapterSubtitle, { color: currentTheme.text }]}
            >
              {currentChapter.title}
            </Text>

            {/* Pembatas dekoratif sederhana */}
            <View
              style={[styles.divider, { backgroundColor: currentTheme.border }]}
            />

            {/* Isi Teks Cerita Novel Panjang secara dinamis */}
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              {currentChapter.content}
            </Text>

            {/* -------------------- TOMBOL NAVIGASI CHAPTER KOMPONEN -------------------- */}
            <ChapterNavigation
              onNext={handleNextChapter}
              onPrev={handlePrevChapter}
              hasNext={hasNext}
              hasPrev={hasPrev}
              currentChapterNumber={currentChapter.chapterNumber}
            />
            {/* ------------------------------------------------------------------------- */}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  novelContainer: {
    marginTop: 10,
  },
  chapterTitle: {
    fontFamily: "Audiowide_400Regular",
    color: "red",
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 4,
  },
  chapterSubtitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 25,
    width: "40%",
  },
  paragraph: {
    color: "#e0e0e0",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 22,
    textAlign: "justify",
    letterSpacing: 0.3,
  },
});
