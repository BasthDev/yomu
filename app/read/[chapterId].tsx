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
import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const getScrollRef = (chapterId: string) => {
    if (!scrollRefs.current[chapterId]) {
      scrollRefs.current[chapterId] = React.createRef<ScrollView>();
    }
    return scrollRefs.current[chapterId];
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
  } = useSecurity();

  const [pendingUnlock, setPendingUnlock] = useState<ChapterItem | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  const match = useMemo(
    () => (chapterId ? findBookAndChapter(chapterId) : null),
    [chapterId, findBookAndChapter],
  );

  const lastMatchRef = useRef(match);
  if (match) {
    lastMatchRef.current = match;
  }
  const activeMatch = match ?? lastMatchRef.current;

  const [access, setAccess] = useState<ChapterAccessResult | null>(null);
  const [prevAccess, setPrevAccess] = useState<ChapterAccessResult | null>(
    null,
  );
  const [nextAccess, setNextAccess] = useState<ChapterAccessResult | null>(
    null,
  );
  const [unlockAccess, setUnlockAccess] = useState<ChapterAccessResult | null>(
    null,
  );

  const { book, chapter, chapterIndex } = activeMatch || {};
  const hasPrev = chapterIndex !== undefined && chapterIndex > 0;
  const hasNext =
    book?.chaptersList && chapterIndex !== undefined
      ? chapterIndex < book.chaptersList.length - 1
      : false;

  const prevChapter =
    hasPrev && book?.chaptersList ? book.chaptersList[chapterIndex - 1] : null;
  const nextChapter =
    hasNext && book?.chaptersList ? book.chaptersList[chapterIndex + 1] : null;

  useEffect(() => {
    let isMounted = true;
    if (activeMatch) {
      checkAccess(activeMatch.book, activeMatch.chapter).then((res) => {
        if (isMounted) setAccess(res);
      });
    } else {
      setAccess(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeMatch, checkAccess]);

  useEffect(() => {
    let isMounted = true;
    if (activeMatch && prevChapter) {
      checkAccess(activeMatch.book, prevChapter).then((res) => {
        if (isMounted) setPrevAccess(res);
      });
    } else {
      setPrevAccess(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeMatch, prevChapter, checkAccess]);

  useEffect(() => {
    let isMounted = true;
    if (activeMatch && nextChapter) {
      checkAccess(activeMatch.book, nextChapter).then((res) => {
        if (isMounted) setNextAccess(res);
      });
    } else {
      setNextAccess(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeMatch, nextChapter, checkAccess]);

  const isUnlockModalVisible =
    pendingUnlock !== null || (access ? !access.canAccess : false);

  const { showPrompt, recordChapterRead, skipBonus, completeBonus } =
    useBonusCoinsPrompt(isInterstitialLoaded, isUnlockModalVisible);

  const unlockTarget = pendingUnlock ?? activeMatch?.chapter ?? null;

  useEffect(() => {
    let isMounted = true;
    if (activeMatch && unlockTarget) {
      checkAccess(activeMatch.book, unlockTarget).then((res) => {
        if (isMounted) setUnlockAccess(res);
      });
    } else {
      setUnlockAccess(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeMatch, unlockTarget, checkAccess]);

  useEffect(() => {
    if (chapterId) {
      loadComments(chapterId);
    }
  }, [chapterId, loadComments]);

  // Preload comments for previous chapter
  useEffect(() => {
    if (prevChapter) {
      loadComments(prevChapter.id);
    }
  }, [prevChapter, loadComments]);

  // Preload comments for next chapter
  useEffect(() => {
    if (nextChapter) {
      loadComments(nextChapter.id);
    }
  }, [nextChapter, loadComments]);

  useEffect(() => {
    if (!match || !access?.canAccess || !chapterId) return;

    updateReadingHistory(
      match.book.id,
      match.chapter.id,
      match.chapter.chapterNumber,
      match.chapter.title,
    );

    recordChapterRead(chapterId);
  }, [
    chapterId,
    access?.canAccess,
    match,
    updateReadingHistory,
    recordChapterRead,
  ]);

  useEffect(() => {
    setPendingUnlock(null);
    // Reset scroll position for current chapter
    const currentScrollRef = getScrollRef(chapterId);
    currentScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [chapterId]);

  // Sync carousel index with current chapter
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

  const handleUnlockWithCoins = async () => {
    if (!activeMatch || !unlockTarget) return;

    setIsUnlocking(true);
    try {
      const success = await unlockWithCoins(activeMatch.book, unlockTarget);
      if (!success) return;

      setPendingUnlock(null);

      // Force refresh access for the current chapter
      const res = await checkAccess(activeMatch.book, activeMatch.chapter);
      setAccess(res);

      // Also refresh prev/next access if needed
      if (prevChapter) {
        const prevRes = await checkAccess(activeMatch.book, prevChapter);
        setPrevAccess(prevRes);
      }
      if (nextChapter) {
        const nextRes = await checkAccess(activeMatch.book, nextChapter);
        setNextAccess(nextRes);
      }

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

      // Force refresh access for the current chapter
      const res = await checkAccess(activeMatch.book, activeMatch.chapter);
      setAccess(res);

      // Also refresh prev/next access if needed
      if (prevChapter) {
        const prevRes = await checkAccess(activeMatch.book, prevChapter);
        setPrevAccess(prevRes);
      }
      if (nextChapter) {
        const nextRes = await checkAccess(activeMatch.book, nextChapter);
        setNextAccess(nextRes);
      }

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

  if (access === null) {
    return (
      <Container>
        <CustomHeader showBack onBack={handleGoBack} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      </Container>
    );
  }

  if (!access.canAccess) {
    return (
      <Container>
        <CustomHeader
          title={`Eps ${chapter.chapterNumber}: ${chapter.title}`}
          showBack
          forceBackPath={`/book/${book.id}`}
        />
        <View style={styles.centered}>
          <Ionicons name="lock-closed" size={48} color="#ffd700" />
          <Text style={[styles.lockedTitle, { color: currentTheme.text }]}>
            Chapter Locked
          </Text>
          <Text
            style={[
              styles.lockedSubtitle,
              { color: currentTheme.textSecondary },
            ]}
          >
            Buy this episode or wait for free access.
          </Text>
          <TouchableOpacity
            style={[
              styles.retryUnlockButton,
              { backgroundColor: currentTheme.primary },
            ]}
            onPress={() => setPendingUnlock(chapter)}
          >
            <Text style={styles.retryUnlockButtonText}>
              Tap to Unlock / Retry
            </Text>
          </TouchableOpacity>
        </View>
        <UnlockModal
          visible={isUnlockModalVisible}
          onClose={handleGoBack}
          onUnlock={handleUnlockWithCoins}
          onUnlockWithAd={handleUnlockWithAd}
          chapterCost={chapterCost}
          balance={balance}
          isUnlocking={isUnlocking}
          isAdLoading={isUnlockAdLoading || !isUnlockAdLoaded}
          daysUntilFree={access.daysUntilFree}
          theme={currentTheme}
        />
      </Container>
    );
  }

  const renderChapterContent = (
    chItem: ChapterItem,
    scrollRefInstance: React.RefObject<ScrollView>,
    accessCheck: ChapterAccessResult | null,
  ) => {
    const isChLocked = accessCheck ? !accessCheck.canAccess : false;
    const chapterComments = comments.filter((c) => c.chapter_id === chItem.id);

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
                  style={[styles.chapterTitle, { color: currentTheme.primary }]}
                >
                  CHAPTER {chItem.chapterNumber}
                </Text>

                {/* Header level Comment Button aligned on the right */}
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
                <View style={styles.inlineLockedContainer}>
                  <Ionicons name="lock-closed" size={32} color="#ffd700" />
                  <Text
                    style={[
                      styles.lockedTitleText,
                      { color: currentTheme.text },
                    ]}
                  >
                    This chapter is locked
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.inlineUnlockButton,
                      { backgroundColor: currentTheme.primary },
                    ]}
                    onPress={() => setPendingUnlock(chItem)}
                  >
                    <Text style={styles.inlineUnlockButtonText}>
                      Tap to Unlock
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
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

            {/* Swipe Instruction Footer pushed to absolute bottom */}
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
  };

  return (
    <Container>
      <CustomHeader
        title={`Eps ${chapter.chapterNumber}: ${chapter.title}`}
        showBack
        forceBackPath={`/book/${book.id}`}
      />

      <Carousel
        loop={false}
        width={SCREEN_WIDTH}
        height={Dimensions.get("window").height - 100}
        data={book?.chaptersList || []}
        defaultIndex={carouselIndex}
        onSnapToItem={handleCarouselIndexChange}
        renderItem={({ item }: { item: ChapterItem }) => {
          const itemAccess =
            item.id === chapterId
              ? access
              : item.id === prevChapter?.id
                ? prevAccess
                : item.id === nextChapter?.id
                  ? nextAccess
                  : null;
          return renderChapterContent(item, getScrollRef(item.id), itemAccess);
        }}
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
  lockedTitle: { fontSize: 20, fontWeight: "bold" },
  lockedSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
    marginBottom: 12,
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
    fontFamily: "Audiowide_400Regular",
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
  sliderViewport: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  sliderView: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
  },
  inlineLockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  lockedTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  retryUnlockButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 10,
  },
  retryUnlockButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  inlineUnlockButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  inlineUnlockButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
