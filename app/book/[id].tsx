import { useSecurity } from "@/context/SecurityContext";
import { useChapterUnlockStore } from "@/store/chapterUnlockStore";
import { useThemeStore } from "@/store/themeStore";
import {
    ChapterAccessResult,
    getChapterDisplayStatusSync,
} from "@/utils/chapterAccess";
import { navigateToRead } from "@/utils/navigation";
import { getRouteParam } from "@/utils/routeParams";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useCoinStore } from "../../store/coinStore";
import { DUMMY_BOOKS } from "../../utils/dummyData";

const { width, height } = Dimensions.get("window");
const BANNER_HEIGHT = 380;

export default function BookDetail() {
  const { id: idParam } = useLocalSearchParams();
  const id = getRouteParam(idParam);
  const router = useRouter();
  const [showBackButton, setShowBackButton] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isBookmarked, addBookmark, removeBookmark, loadData } =
    useBookmarkStore();
  const { currentTheme } = useThemeStore();
  const { balance } = useCoinStore();
  const { checkAccess, unlockWithCoins, chapterCost } = useSecurity();
  const purchasedChapterIds = useChapterUnlockStore(
    (state) => state.purchasedChapterIds,
  );

  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [chapterAccess, setChapterAccess] =
    useState<ChapterAccessResult | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const book = DUMMY_BOOKS.find((b) => b.id === id);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleBookmark = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      if (isBookmarked(id)) {
        await removeBookmark(id);
      } else {
        await addBookmark(id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChapterPress = (chapter: any) => {
    const access = checkAccess(book!, chapter);

    if (access.canAccess) {
      navigateToRead(router, chapter.id);
    } else {
      setSelectedChapter(chapter);
      setChapterAccess(access);
      setShowUnlockModal(true);
    }
  };

  const handleUnlockWithCoins = async () => {
    setIsUnlocking(true);
    try {
      const success = await unlockWithCoins(book!, selectedChapter);
      if (success) {
        setShowUnlockModal(false);
        navigateToRead(router, selectedChapter.id);
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!id) {
    return (
      <Container>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      </Container>
    );
  }

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
    <AuthGuard>
      <Container>
        <View style={styles.topNavigation}>
          <View style={styles.topNavLeft}>
            {showBackButton && (
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
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
                  name={isBookmarked(id) ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={isBookmarked(id) ? currentTheme.primary : "#fff"}
                />
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: book.banner }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(18, 18, 18, 0.1)",
              "rgba(18, 18, 18, 0.5)",
              "#121212",
            ]}
            locations={[0, 0.6, 1]}
            style={styles.gradientOverlay}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            setShowBackButton(event.nativeEvent.contentOffset.y < 150);
          }}
          scrollEventThrottle={16}
        >
          <View style={styles.headerSpacer} />
          <ContentWithPadding style={styles.mainContent}>
            <View style={styles.metaRow}>
              <View style={styles.badgeHot}>
                <Text style={styles.badgeText}>
                  {book.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={14} color="#ffcc00" />
                <Text style={styles.ratingText}>{book.rating.toFixed(1)}</Text>
              </View>
            </View>

            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>Author: {book.author}</Text>

            <View style={styles.genreContainer}>
              {book.genre.map((g, idx) => (
                <View key={idx} style={styles.genreTag}>
                  <Text style={styles.genreTagText}>{g}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>SINOPSIS</Text>
            <Text style={styles.description}>{book.description}</Text>

            <Text style={styles.sectionTitle}>DAFTAR CHAPTER</Text>

            <View style={styles.episodeListContainer}>
              {book.chaptersList?.map((chapter) => {
                const status = getChapterDisplayStatusSync(
                  book,
                  chapter,
                  purchasedChapterIds,
                );

                return (
                  <Pressable
                    key={chapter.id}
                    style={styles.episodeCard}
                    onPress={() => handleChapterPress(chapter)}
                  >
                    <View style={styles.episodeLeft}>
                      <View
                        style={[
                          styles.episodeIconBox,
                          { backgroundColor: currentTheme.primary + "20" },
                        ]}
                      >
                        <Ionicons
                          name="book"
                          size={18}
                          color={currentTheme.primary}
                        />
                      </View>
                      <View style={styles.episodeMeta}>
                        <Text
                          style={[
                            styles.episodeNumber,
                            { color: currentTheme.text },
                          ]}
                        >
                          Chapter {chapter.chapterNumber}
                        </Text>
                        <Text
                          style={[
                            styles.episodeTitle,
                            { color: currentTheme.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {chapter.title}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.episodeRight}>
                      {status === "free" && (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>FREE</Text>
                        </View>
                      )}
                      {status === "wait_available" && (
                        <View style={styles.waitBadge}>
                          <Text style={styles.waitBadgeText}>WAIT</Text>
                        </View>
                      )}
                      {status === "unlocked" && (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>BOUGHT</Text>
                        </View>
                      )}
                      {status === "locked" && (
                        <View style={styles.lockBadge}>
                          <Ionicons
                            name="lock-closed"
                            size={14}
                            color="#ffd700"
                          />
                          <Text style={styles.lockBadgeText}>
                            {chapterCost}
                          </Text>
                        </View>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={currentTheme.textSecondary}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ContentWithPadding>
        </ScrollView>

        <Modal
          visible={showUnlockModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUnlockModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Chapter Locked
              </Text>
              <Text
                style={[
                  styles.modalText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                You need to unlock this chapter to read it.
              </Text>

              {chapterAccess && (
                <View style={styles.unlockOptions}>
                  <TouchableOpacity
                    style={[
                      styles.unlockOption,
                      { backgroundColor: currentTheme.background },
                    ]}
                    onPress={handleUnlockWithCoins}
                    disabled={isUnlocking || balance < chapterCost}
                  >
                    <Ionicons
                      name="wallet"
                      size={24}
                      color={currentTheme.primary}
                    />
                    <View style={styles.unlockOptionText}>
                      <Text
                        style={[
                          styles.unlockOptionTitle,
                          { color: currentTheme.text },
                        ]}
                      >
                        Unlock with Coins
                      </Text>
                      <Text
                        style={[
                          styles.unlockOptionSubtitle,
                          { color: currentTheme.textSecondary },
                        ]}
                      >
                        {balance >= chapterCost
                          ? `${chapterCost} coins (You have ${balance})`
                          : `Need ${chapterCost} coins (You have ${balance})`}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {chapterAccess.reason === "wait_required" &&
                    chapterAccess.daysUntilFree &&
                    chapterAccess.daysUntilFree > 0 && (
                      <View
                        style={[
                          styles.unlockOption,
                          { backgroundColor: currentTheme.background },
                        ]}
                      >
                        <Ionicons name="time" size={24} color="#ffd700" />
                        <View style={styles.unlockOptionText}>
                          <Text
                            style={[
                              styles.unlockOptionTitle,
                              { color: currentTheme.text },
                            ]}
                          >
                            Wait for Free Access
                          </Text>
                          <Text
                            style={[
                              styles.unlockOptionSubtitle,
                              { color: currentTheme.textSecondary },
                            ]}
                          >
                            Available in {chapterAccess.daysUntilFree}{" "}
                            {chapterAccess.daysUntilFree === 1 ? "day" : "days"}
                          </Text>
                        </View>
                      </View>
                    )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: currentTheme.background },
                ]}
                onPress={() => setShowUnlockModal(false)}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Container>
    </AuthGuard>
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
  topNavLeft: { flexDirection: "row", alignItems: "center" },
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
  bannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width,
    height: BANNER_HEIGHT,
    zIndex: 1,
  },
  bannerImage: { width: "100%", height: "100%" },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },
  scrollView: { flex: 1, zIndex: 2 },
  scrollContent: { paddingBottom: 60 },
  headerSpacer: { height: BANNER_HEIGHT - 30 },
  mainContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    minHeight: height - 120,
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
  episodeRight: { flexDirection: "row", alignItems: "center", gap: 8 },
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
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  episodeTitle: { fontSize: 15, fontWeight: "600" },
  freeBadge: {
    backgroundColor: "rgba(0, 255, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeBadgeText: { color: "#00ff00", fontSize: 10, fontWeight: "bold" },
  waitBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  waitBadgeText: { color: "#ffd700", fontSize: 10, fontWeight: "bold" },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lockBadgeText: { color: "#ffd700", fontSize: 10, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  unlockOptions: { gap: 12, marginBottom: 16 },
  unlockOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  unlockOptionText: { flex: 1 },
  unlockOptionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  unlockOptionSubtitle: { fontSize: 14 },
  closeButton: { padding: 16, borderRadius: 12, alignItems: "center" },
  closeButtonText: { fontSize: 16, fontWeight: "600" },
});
