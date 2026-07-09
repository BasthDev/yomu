import { BonusCoinsModal } from "@/components/BonusCoinsModal";
import { Container } from "@/components/Container";
import { ContentWithPadding } from "@/components/Content";
import { CustomHeader } from "@/components/Header";
import { UnlockModal } from "@/components/UnlockModal";
import { useSecurity } from "@/context/SecurityContext";
import { useBonusCoinsPrompt } from "@/hooks/useBonusCoinsPrompt";
import { useThemeStore } from "@/store/themeStore";
import { ChapterItem } from "@/utils/books";
import { ChapterAccessResult } from "@/utils/chapterAccess";
import { navigateToComments } from "@/utils/navigation";
import { getRouteParam } from "@/utils/routeParams";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useGlobalRewardedAd } from "../../context/AdContext";
import { useRewardedInterstitialAd } from "../../hooks/useRewardedInterstitialAd";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useChapterUnlockStore } from "../../store/chapterUnlockStore";
import { useCoinStore } from "../../store/coinStore";
import { useCommentStore } from "../../store/commentStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Read() {
  const { chapterId: chapterIdParam } = useLocalSearchParams<{
    chapterId: string;
  }>();
  const chapterId = getRouteParam(chapterIdParam);
  const router = useRouter();
  const scrollRefs = useRef<Record<string, React.RefObject<ScrollView>>>({});

  const getScrollRef = (id: string) => {
    if (!scrollRefs.current[id]) {
      scrollRefs.current[id] = React.createRef<ScrollView>();
    }
    return scrollRefs.current[id];
  };

  const { updateReadingHistory } = useBookmarkStore();
  const { currentTheme } = useThemeStore();
  const { comments, loadComments } = useCommentStore();
  const { balance } = useCoinStore();
  const {
    checkAccess,
    unlockWithCoins,
    unlockWithAd,
    findBookAndChapter,
    chapterCost,
    refreshUnlocks,
  } = useSecurity();

  const match = useMemo(
    () => (chapterId ? findBookAndChapter(chapterId) : null),
    [chapterId, findBookAndChapter],
  );

  const lastMatchRef = useRef(match);
  if (match) {
    lastMatchRef.current = match;
  }
  const activeMatch = match ?? lastMatchRef.current;
  const { book, chapter, chapterIndex } = activeMatch || {};

  const [pendingUnlock, setPendingUnlock] = useState<ChapterItem | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [carouselIndex, setCarouselIndex] = useState(() => {
    if (activeMatch && book?.chaptersList) {
      const idx = book.chaptersList.findIndex((ch) => ch.id === chapterId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  const purchasedChapterIds = useChapterUnlockStore(
    (state) => state.purchasedChapterIds,
  );

  // accessMap: chapterId -> ChapterAccessResult | null
  // undefined = not yet checked, null = currently checking, result = done
  const [accessMap, setAccessMap] = useState<
    Record<string, ChapterAccessResult | null>
  >({});

  const {
    isLoaded: isInterstitialLoaded,
    isLoading: isInterstitialLoading,
    showAd: showInterstitialAd,
  } = useRewardedInterstitialAd();

  const {
    isRewardedLoaded: isUnlockAdLoaded,
    isRewardedLoading: isUnlockAdLoading,
    showRewardedAd: showUnlockAd,
  } = useGlobalRewardedAd();

  const hasPrev = chapterIndex !== undefined && chapterIndex > 0;
  const hasNext =
    book?.chaptersList && chapterIndex !== undefined
      ? chapterIndex < book.chaptersList.length - 1
      : false;

  const prevChapter =
    hasPrev && book?.chaptersList ? book.chaptersList[chapterIndex - 1] : null;
  const nextChapter =
    hasNext && book?.chaptersList ? book.chaptersList[chapterIndex + 1] : null;

  const checkAccessSync = useCallback(
    (chItem: ChapterItem): ChapterAccessResult => {
      if (!book) return { canAccess: false };
      if (book.isFree || !chItem.isLocked) {
        return { canAccess: true, reason: "free" };
      }
      if (purchasedChapterIds[chItem.id]) {
        return { canAccess: true, reason: "unlocked" };
      }

      // Calculate wait days
      const releaseDate = new Date(chItem.releasedAt);
      const now = new Date();
      const diffMs = now.getTime() - releaseDate.getTime();
      const daysSinceRelease = diffMs / (1000 * 60 * 60 * 24);

      if (daysSinceRelease >= 3) {
        return { canAccess: true, reason: "wait_available" };
      }

      return {
        canAccess: false,
        reason: "coins_needed",
        daysUntilFree: Math.ceil(3 - daysSinceRelease),
      };
    },
    [book, purchasedChapterIds],
  );

  // Check access for a chapter, store in map (null while checking)
  const checkAndStoreAccess = useCallback(
    async (bookObj: typeof book, chapterObj: ChapterItem) => {
      if (!bookObj) return;
      setAccessMap((prev) => ({ ...prev, [chapterObj.id]: null })); // mark as checking
      const res = await checkAccess(bookObj, chapterObj);
      setAccessMap((prev) => ({ ...prev, [chapterObj.id]: res }));
    },
    [checkAccess],
  );

  // On mount / when book loads: pre-check ALL chapters in background so swipe is instant
  useEffect(() => {
    if (!book?.chaptersList || !book) return;
    let cancelled = false;
    const preloadAll = async () => {
      for (const ch of book.chaptersList!) {
        if (cancelled) break;
        // Skip if already have a result (not null/undefined)
        if (accessMap[ch.id] !== undefined && accessMap[ch.id] !== null)
          continue;
        setAccessMap((prev) => ({ ...prev, [ch.id]: null })); // mark checking
        const res = await checkAccess(book, ch);
        if (!cancelled) {
          setAccessMap((prev) => ({ ...prev, [ch.id]: res }));
        }
      }
    };
    preloadAll();
    return () => {
      cancelled = true;
    };
    // Only re-run when book changes (not accessMap to avoid infinite loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, checkAccess]);

  // Re-check current chapter specifically when chapterId changes (fast path)
  useEffect(() => {
    if (!activeMatch || !book) return;
    // Only re-check if we don't already have a fresh result
    const existing = accessMap[activeMatch.chapter.id];
    if (existing === null) return; // already checking
    checkAndStoreAccess(book, activeMatch.chapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatch?.chapter.id]);

  // Current chapter access (resolved synchronously to prevent delay)
  const currentAccess = activeMatch
    ? checkAccessSync(activeMatch.chapter)
    : null;
  const access = currentAccess;

  const isUnlockModalVisible =
    pendingUnlock !== null ||
    (currentAccess !== null && !currentAccess.canAccess);

  const { showPrompt, recordChapterRead, skipBonus, completeBonus } =
    useBonusCoinsPrompt(isInterstitialLoaded, isUnlockModalVisible);

  const unlockTarget = pendingUnlock ?? activeMatch?.chapter ?? null;

  // Access for the unlock modal's daysUntilFree display
  const unlockAccess = unlockTarget ? accessMap[unlockTarget.id] : null;

  useEffect(() => {
    if (chapterId) {
      loadComments(chapterId);
    }
  }, [chapterId, loadComments]);

  useEffect(() => {
    if (prevChapter) {
      loadComments(prevChapter.id);
    }
  }, [prevChapter, loadComments]);

  useEffect(() => {
    if (nextChapter) {
      loadComments(nextChapter.id);
    }
  }, [nextChapter, loadComments]);

  useEffect(() => {
    if (!match || !chapterId) return;

    const syncAccess = checkAccessSync(match.chapter);

    // Record reading history only when unlocked
    if (syncAccess.canAccess) {
      updateReadingHistory(
        match.book.id,
        match.chapter.id,
        match.chapter.chapterNumber,
        match.chapter.title,
      );
      // Record chapter read for bonus prompt counting ONLY if it is unlocked
      recordChapterRead(chapterId);
    }
  }, [
    chapterId,
    match,
    updateReadingHistory,
    recordChapterRead,
    checkAccessSync,
  ]);

  useEffect(() => {
    setPendingUnlock(null);
    const currentScrollRef = getScrollRef(chapterId ?? "");
    currentScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [chapterId]);

  useEffect(() => {
    if (activeMatch && book?.chaptersList) {
      const currentIndex = book.chaptersList.findIndex(
        (ch) => ch.id === chapterId,
      );
      if (currentIndex !== -1 && currentIndex !== carouselIndex) {
        setCarouselIndex(currentIndex);
      }
    }
  }, [chapterId, activeMatch, book, carouselIndex]);

  // Keep accessMap in a ref so renderItem always reads latest without causing re-renders
  const accessMapRef = useRef(accessMap);
  useEffect(() => {
    accessMapRef.current = accessMap;
  });

  // carouselData is STABLE - does NOT depend on accessMap to avoid remounting carousel items
  const carouselData = useMemo(() => {
    return book?.chaptersList || [];
  }, [book?.chaptersList]);

  const refreshAccessAfterUnlock = useCallback(
    async (unlockedChapterId: string) => {
      if (!activeMatch || !book) return;

      // Re-hydrate the store so purchasedChapterIds is fresh for future checks
      await refreshUnlocks();

      // Directly mark the unlocked chapter as accessible - no need to re-query
      // since we KNOW the unlock succeeded
      setAccessMap((prev) => ({
        ...prev,
        [unlockedChapterId]: { canAccess: true, reason: "unlocked" as const },
      }));

      // Re-check current chapter access only if it's not the one we just unlocked
      if (activeMatch.chapter.id !== unlockedChapterId) {
        const res = await checkAccess(book, activeMatch.chapter);
        setAccessMap((prev) => ({ ...prev, [activeMatch.chapter.id]: res }));
      }
      if (prevChapter && prevChapter.id !== unlockedChapterId) {
        const prevRes = await checkAccess(book, prevChapter);
        setAccessMap((prev) => ({ ...prev, [prevChapter.id]: prevRes }));
      }
      if (nextChapter && nextChapter.id !== unlockedChapterId) {
        const nextRes = await checkAccess(book, nextChapter);
        setAccessMap((prev) => ({ ...prev, [nextChapter.id]: nextRes }));
      }
    },
    [activeMatch, book, prevChapter, nextChapter, checkAccess, refreshUnlocks],
  );

  const handleUnlockWithCoins = async () => {
    if (!activeMatch || !unlockTarget) return;

    setIsUnlocking(true);
    try {
      const success = await unlockWithCoins(activeMatch.book, unlockTarget);
      if (!success) return;

      setPendingUnlock(null);

      // Immediately reflect unlock in UI — no stale re-check needed
      await refreshAccessAfterUnlock(unlockTarget.id);

      if (unlockTarget.id !== chapterId) {
        router.setParams({ chapterId: unlockTarget.id });
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleUnlockWithAd = async () => {
    if (!activeMatch || !unlockTarget || !isUnlockAdLoaded) return;

    setIsUnlocking(true);
    try {
      const { earned } = await showUnlockAd();
      if (!earned) return;

      const success = await unlockWithAd(activeMatch.book, unlockTarget);
      if (!success) return;

      setPendingUnlock(null);

      // Immediately reflect unlock in UI — no stale re-check needed
      await refreshAccessAfterUnlock(unlockTarget.id);

      if (unlockTarget.id !== chapterId) {
        router.setParams({ chapterId: unlockTarget.id });
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleWatchBonusAd = async () => {
    if (!isInterstitialLoaded) return;

    const { earned } = await showInterstitialAd();
    if (earned) {
      completeBonus();
      return;
    }

    skipBonus();
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleCarouselIndexChange = (index: number) => {
    if (book?.chaptersList && book.chaptersList[index]) {
      const targetChapter = book.chaptersList[index];
      setCarouselIndex(index);
      router.setParams({ chapterId: targetChapter.id });
    }
  };

  if (!chapterId) {
    return (
      <Container>
        <CustomHeader showBack onBack={handleGoBack} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      </Container>
    );
  }

  if (!activeMatch || !book || !chapter) {
    return (
      <Container>
        <CustomHeader showBack onBack={handleGoBack} />
        <View style={styles.centered}>
          <Text style={{ color: "#fff" }}>Chapter content not found.</Text>
        </View>
      </Container>
    );
  }

  // Stable renderItem - reads accessMapRef.current (ref, not state) so it never causes re-renders
  const renderChapterContent = useCallback(
    (chItem: ChapterItem, scrollRefInstance: React.RefObject<ScrollView>) => {
      // 1. Resolve access synchronously first to render content or lock screen immediately
      const syncAccess = checkAccessSync(chItem);

      // 2. Check if we have an override in the access map (e.g. from background preloads or unlocking)
      const itemAccess = accessMapRef.current[chItem.id];

      // Determine final access status
      const canAccess =
        syncAccess.canAccess || (itemAccess?.canAccess ?? false);
      const isChLocked = !canAccess;

      const chapterComments = comments.filter(
        (c) => c.chapter_id === chItem.id,
      );

      return (
        <ScrollView
          ref={scrollRefInstance}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ContentWithPadding style={{ flexGrow: 1 }}>
            <View
              style={[
                styles.novelContainer,
                { flexGrow: 1, justifyContent: "space-between" },
              ]}
            >
              <View>
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.chapterTitle,
                      { color: currentTheme.primary },
                    ]}
                  >
                    CHAPTER {chItem.chapterNumber}
                  </Text>

                  <TouchableOpacity
                    style={styles.commentsHeaderIcon}
                    onPress={() => navigateToComments(router, chItem.id)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={currentTheme.primary}
                    />
                    <Text
                      style={[
                        styles.commentsTitleText,
                        { color: currentTheme.text },
                      ]}
                    >
                      ({chapterComments.length})
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.chapterSubtitle, { color: currentTheme.text }]}
                >
                  {chItem.title}
                </Text>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: currentTheme.border },
                  ]}
                />

                {isChLocked ? (
                  /* Definitively locked — show lock card only */
                  <View
                    style={[
                      styles.inlineLockedContainer,
                      { borderColor: currentTheme.border },
                    ]}
                  >
                    <Ionicons name="lock-closed" size={40} color="#ffd700" />
                    <Text
                      style={[
                        styles.lockedTitleText,
                        { color: currentTheme.text },
                      ]}
                    >
                      This chapter is locked
                    </Text>
                    <Text
                      style={[
                        styles.lockedSubText,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Unlock this chapter to continue reading
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.inlineUnlockButton,
                        { backgroundColor: currentTheme.primary },
                      ]}
                      onPress={() => setPendingUnlock(chItem)}
                    >
                      <Ionicons name="lock-open" size={16} color="#fff" />
                      <Text style={styles.inlineUnlockButtonText}>
                        Tap to Unlock
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Unlocked — show content */
                  <Text
                    style={[
                      styles.paragraph,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {chItem.content}
                  </Text>
                )}
              </View>

              <View style={styles.swipeInstructionContainer}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={16}
                  color={currentTheme.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={[
                    styles.swipeInstructionText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  Swipe left or right to change chapter
                </Text>
              </View>
            </View>
          </ContentWithPadding>
        </ScrollView>
      );
      // Only stable deps - comments, theme, and checkAccessSync
    },
    [comments, currentTheme, setPendingUnlock, checkAccessSync],
  );

  // Determine title chapter synchronously from carouselIndex to avoid param sync blinking
  const titleChapter =
    (book?.chaptersList && book.chaptersList[carouselIndex]) || chapter;

  return (
    <Container>
      <CustomHeader
        title={book.title}
        showBack
        forceBackPath={`/book/${book.id}`}
      />

      <Carousel
        loop={false}
        width={SCREEN_WIDTH}
        height={Dimensions.get("window").height - 100}
        data={carouselData}
        defaultIndex={carouselIndex}
        onSnapToItem={handleCarouselIndexChange}
        renderItem={useCallback(
          ({ item }: { item: ChapterItem }) =>
            renderChapterContent(item, getScrollRef(item.id)),
          [renderChapterContent],
        )}
      />

      <UnlockModal
        visible={pendingUnlock !== null}
        onClose={() => setPendingUnlock(null)}
        onUnlock={handleUnlockWithCoins}
        onUnlockWithAd={handleUnlockWithAd}
        chapterCost={chapterCost}
        balance={balance}
        isUnlocking={isUnlocking}
        isAdLoading={isUnlockAdLoading || !isUnlockAdLoaded}
        daysUntilFree={unlockAccess?.daysUntilFree}
        theme={currentTheme}
      />

      <BonusCoinsModal
        visible={showPrompt}
        onSkip={skipBonus}
        onWatchAd={handleWatchBonusAd}
        isAdLoaded={isInterstitialLoaded}
        isAdLoading={isInterstitialLoading}
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
    gap: 12,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40, flexGrow: 1 },
  novelContainer: { marginTop: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chapterTitle: {
    fontFamily: "Literata-Regular",
    fontSize: 14,
    letterSpacing: 2,
  },
  chapterSubtitle: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    marginBottom: 20,
  },
  divider: { height: 1, marginBottom: 25, width: "40%" },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 22,
    textAlign: "justify",
    letterSpacing: 0.3,
  },
  swipeInstructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 48,
    marginBottom: 8,
    opacity: 0.5,
  },
  swipeInstructionText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  commentsHeaderIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  commentsTitleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inlineLockedContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  lockedTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  lockedSubText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: -4,
  },
  inlineUnlockButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
    elevation: 4,
  },
  inlineUnlockButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
