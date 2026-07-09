import { UnlockModal } from "@/components/UnlockModal";
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
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "../../components/Container";
import { ContentWithPadding } from "../../components/Content";
import { useGlobalRewardedAd } from "../../context/AdContext";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useBookRatingsStore } from "../../store/bookRatingsStore";
import { useCoinStore } from "../../store/coinStore";
import { DUMMY_BOOKS } from "../../utils/dummyData";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const { width, height } = Dimensions.get("window");
const BANNER_HEIGHT = 280;

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
  const { checkAccess, unlockWithCoins, unlockWithAd, chapterCost } =
    useSecurity();
  const purchasedChapterIds = useChapterUnlockStore(
    (state) => state.purchasedChapterIds,
  );
  const { getUserRating, loadBookRating, rateBook, ratings, ratingCounts } =
    useBookRatingsStore();
  const userRating = getUserRating(id || "");
  const averageRating = ratings[id || ""] || 0;
  const ratingCount = ratingCounts[id || ""] || 0;

  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [chapterAccess, setChapterAccess] =
    useState<ChapterAccessResult | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const { isRewardedLoaded, isRewardedLoading, showRewardedAd } =
    useGlobalRewardedAd();

  const book = DUMMY_BOOKS.find((b) => b.id === id);

  // Calculate total comments from all chapters
  const totalChapterComments =
    book?.chaptersList?.reduce((total, chapter) => {
      return total + (chapter.comments?.length || 0);
    }, 0) || 0;

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (id) {
      loadBookRating(id);
    }
  }, [id, loadBookRating]);

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

  const handleChapterPress = async (chapter: any) => {
    const access = await checkAccess(book!, chapter);

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

  const handleUnlockWithAd = async () => {
    if (!isRewardedLoaded) return;

    setIsUnlocking(true);
    try {
      const { earned } = await showRewardedAd();
      if (!earned) return;

      const success = await unlockWithAd(book!, selectedChapter);
      if (success) {
        setShowUnlockModal(false);
        navigateToRead(router, selectedChapter.id);
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleRateBook = (rating: number) => {
    Alert.alert(
      "Rate this novel",
      `You rated this novel ${rating} star${rating !== 1 ? "s" : ""}`,
      [{ text: "OK", onPress: () => rateBook(id!, rating) }],
    );
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
          <Text style={{ color: currentTheme.text }}>Novel not found.</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.topNavigation}>
        <View style={styles.topNavLeft}>
          {showBackButton && (
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.backButton,
                { backgroundColor: currentTheme.background + "80" },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentTheme.text}
              />
            </Pressable>
          )}
        </View>
        {showBackButton && (
          <Pressable
            onPress={toggleBookmark}
            style={[
              styles.bookmarkButton,
              { backgroundColor: currentTheme.background + "80" },
            ]}
            disabled={isSaving}
          >
            {isSaving ? (
              <Ionicons
                name="time"
                size={24}
                color={currentTheme.textSecondary}
              />
            ) : (
              <Ionicons
                name={isBookmarked(id) ? "bookmark" : "bookmark-outline"}
                size={24}
                color={
                  isBookmarked(id) ? currentTheme.primary : currentTheme.text
                }
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
            currentTheme.background + "10",
            currentTheme.background + "80",
            currentTheme.background,
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
        <ContentWithPadding
          style={[
            styles.mainContent,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <View style={styles.metaRow}>
            <View
              style={[
                styles.badgeHot,
                { backgroundColor: currentTheme.primary },
              ]}
            >
              <Text style={styles.badgeText}>{book.status.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#ffcc00" />
              <Text style={[styles.ratingText, { color: currentTheme.text }]}>
                {averageRating.toFixed(1)}
              </Text>
              <Text
                style={[
                  styles.ratingCount,
                  { color: currentTheme.textSecondary },
                ]}
              >
                ({ratingCount})
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="eye-outline"
                size={16}
                color={currentTheme.textSecondary}
              />
              <Text
                style={[styles.statText, { color: currentTheme.textSecondary }]}
              >
                {formatCount(book.viewsCount)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="heart-outline"
                size={16}
                color={currentTheme.textSecondary}
              />
              <Text
                style={[styles.statText, { color: currentTheme.textSecondary }]}
              >
                {formatCount(book.favoritesCount)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={currentTheme.textSecondary}
              />
              <Text
                style={[styles.statText, { color: currentTheme.textSecondary }]}
              >
                {formatCount(totalChapterComments)}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: currentTheme.text }]}>
            {book.title}
          </Text>
          <Text style={[styles.author, { color: currentTheme.textSecondary }]}>
            Author: {book.author}
          </Text>

          <View style={styles.genreContainer}>
            {book.genre.map((g, idx) => (
              <View
                key={idx}
                style={[
                  styles.genreTag,
                  { backgroundColor: currentTheme.primary + "20" },
                ]}
              >
                <Text
                  style={[styles.genreTagText, { color: currentTheme.primary }]}
                >
                  {g}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            SINOPSIS
          </Text>
          <Text
            style={[styles.description, { color: currentTheme.textSecondary }]}
          >
            {book.description}
          </Text>

          <View style={styles.ratingSection}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              RATE THIS NOVEL
            </Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRateBook(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= (userRating || 0) ? "star" : "star-outline"}
                    size={32}
                    color={star <= (userRating || 0) ? "#ffcc00" : "#666"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text
              style={[styles.ratingHint, { color: currentTheme.textSecondary }]}
            >
              {userRating
                ? `Your rating: ${userRating} star${userRating !== 1 ? "s" : ""}`
                : "Tap to rate"}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            CHAPTER LIST
          </Text>

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
                  style={[
                    styles.episodeCard,
                    { backgroundColor: currentTheme.surface },
                  ]}
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
                      <View
                        style={[
                          styles.freeBadge,
                          { backgroundColor: currentTheme.success + "30" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.freeBadgeText,
                            { color: currentTheme.success },
                          ]}
                        >
                          FREE
                        </Text>
                      </View>
                    )}
                    {status === "wait_available" && (
                      <View
                        style={[
                          styles.waitBadge,
                          { backgroundColor: currentTheme.warning + "30" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.waitBadgeText,
                            { color: currentTheme.warning },
                          ]}
                        >
                          WAIT
                        </Text>
                      </View>
                    )}
                    {status === "unlocked" && (
                      <View
                        style={[
                          styles.openBadge,
                          { backgroundColor: currentTheme.success + "30" },
                        ]}
                      >
                        <Ionicons
                          name="lock-open"
                          size={14}
                          color={currentTheme.success}
                        />
                        {/* <Text
                          style={[
                            styles.lockBadgeText,
                            { color: currentTheme.success },
                          ]}
                        >
                          UNLOCKED
                        </Text> */}
                      </View>
                    )}
                    {status === "locked" && (
                      <View
                        style={[
                          styles.lockBadge,
                          { backgroundColor: currentTheme.warning + "30" },
                        ]}
                      >
                        <Ionicons
                          name="disc-outline"
                          size={14}
                          color={currentTheme.warning}
                        />
                        <Text
                          style={[
                            styles.lockBadgeText,
                            { color: currentTheme.warning },
                          ]}
                        >
                          {chapterCost}
                        </Text>
                        {/* <Ionicons
                          name="disc-outline"
                          size={14}
                          color={currentTheme.warning}
                        /> */}
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

      <UnlockModal
        visible={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={handleUnlockWithCoins}
        onUnlockWithAd={handleUnlockWithAd}
        chapterCost={chapterCost}
        balance={balance}
        isUnlocking={isUnlocking}
        isAdLoading={isRewardedLoading || !isRewardedLoaded}
        daysUntilFree={chapterAccess?.daysUntilFree}
        theme={currentTheme}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    minHeight: height - 120,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  badgeHot: {
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
  ratingText: { fontSize: 14, fontWeight: "bold" },
  ratingCount: { fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
  },
  ratingSection: { marginTop: 24, marginBottom: 24 },
  starContainer: { flexDirection: "row", gap: 8, marginTop: 12 },
  starButton: { padding: 8 },
  ratingHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  title: {
    fontFamily: "Lora-Bold",
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 6,
  },
  author: { fontSize: 14, marginBottom: 16 },
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
    fontFamily: "Lora-Bold",
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
    display: "none",
  },
  openBadge: {
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
