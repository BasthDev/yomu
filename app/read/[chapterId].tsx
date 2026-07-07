import { BonusCoinsModal } from "@/components/BonusCoinsModal";
import { ChapterNavigation } from "@/components/ChapterNavigation";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRewardedAd } from "../../hooks/useRewardedAd";
import { useRewardedInterstitialAd } from "../../hooks/useRewardedInterstitialAd";
import { useBookmarkStore } from "../../store/bookmarkStore";
import { useCoinStore } from "../../store/coinStore";
import { useCommentStore } from "../../store/commentStore";

export default function Read() {
  const { chapterId: chapterIdParam } = useLocalSearchParams<{
    chapterId: string;
  }>();
  const chapterId = getRouteParam(chapterIdParam);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { updateReadingHistory } = useBookmarkStore();
  const { currentTheme } = useThemeStore();
  const { comments, loadComments } = useCommentStore();
  const { balance } = useCoinStore();
  const { checkAccess, unlockWithCoins, unlockWithAd, findBookAndChapter, chapterCost } =
    useSecurity();

  const [pendingUnlock, setPendingUnlock] = useState<ChapterItem | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const {
    isLoaded: isInterstitialLoaded,
    isLoading: isInterstitialLoading,
    showAd: showInterstitialAd,
  } = useRewardedInterstitialAd();

  const { isLoaded: isUnlockAdLoaded, isLoading: isUnlockAdLoading, showAd: showUnlockAd } =
    useRewardedAd();

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
  const [unlockAccess, setUnlockAccess] = useState<ChapterAccessResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (activeMatch) {
      checkAccess(activeMatch.book, activeMatch.chapter).then((res) => {
        if (isMounted) setAccess(res);
      });
    } else {
      setAccess(null);
    }
    return () => { isMounted = false; };
  }, [activeMatch, checkAccess]);

  const isUnlockModalVisible = pendingUnlock !== null || (access ? !access.canAccess : false);

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
    return () => { isMounted = false; };
  }, [activeMatch, unlockTarget, checkAccess]);

  useEffect(() => {
    if (chapterId) {
      loadComments(chapterId);
    }
  }, [chapterId, loadComments]);

  useEffect(() => {
    if (!match || !access?.canAccess || !chapterId) return;

    updateReadingHistory(
      match.book.id,
      match.chapter.id,
      match.chapter.chapterNumber,
      match.chapter.title,
    );

    recordChapterRead(chapterId);
  }, [chapterId, access?.canAccess, match, updateReadingHistory, recordChapterRead]);

  useEffect(() => {
    setPendingUnlock(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [chapterId]);

  const handleUnlockWithCoins = async () => {
    if (!activeMatch || !unlockTarget) return;

    setIsUnlocking(true);
    try {
      const success = await unlockWithCoins(activeMatch.book, unlockTarget);
      if (!success) return;

      setPendingUnlock(null);
      if (unlockTarget.id !== chapterId) {
        navigateToUnlockedChapter(unlockTarget);
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
      if (unlockTarget.id !== chapterId) {
        navigateToUnlockedChapter(unlockTarget);
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

  const navigateToUnlockedChapter = (targetChapter: ChapterItem) => {
    if (!activeMatch?.book.chaptersList) return;

    const targetIndex = activeMatch.book.chaptersList.findIndex(
      (ch) => ch.id === targetChapter.id,
    );
    if (targetIndex === -1) return;

    if (targetIndex > activeMatch.chapterIndex) {
      router.setParams({ chapterId: targetChapter.id });
      return;
    }

    if (targetIndex < activeMatch.chapterIndex && router.canGoBack()) {
      router.back();
      return;
    }

    router.setParams({ chapterId: targetChapter.id });
  };

  const goToNextChapter = async (chapter: ChapterItem) => {
    if (!activeMatch) return;
    const nextAccess = await checkAccess(activeMatch.book, chapter);
    if (nextAccess.canAccess) {
      setPendingUnlock(null);
      router.setParams({ chapterId: chapter.id });
      return;
    }
    setPendingUnlock(chapter);
  };

  const goToPrevChapter = async (chapter: ChapterItem) => {
    if (!activeMatch) return;
    const prevAccess = await checkAccess(activeMatch.book, chapter);
    if (!prevAccess.canAccess) {
      setPendingUnlock(chapter);
      return;
    }

    setPendingUnlock(null);
    router.setParams({ chapterId: chapter.id });
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
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

  if (!activeMatch) {
    return (
      <Container>
        <CustomHeader showBack onBack={handleGoBack} />
        <View style={styles.centered}>
          <Text style={{ color: "#fff" }}>Konten bab tidak ditemukan.</Text>
        </View>
      </Container>
    );
  }

  const { book, chapter, chapterIndex } = activeMatch;
  const hasPrev = chapterIndex > 0;
  const hasNext = book.chaptersList
    ? chapterIndex < book.chaptersList.length - 1
    : false;

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
        </View>
        <UnlockModal
          visible
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

  return (
    <Container>
      <CustomHeader
        title={`Eps ${chapter.chapterNumber}: ${chapter.title}`}
        showBack
        forceBackPath={`/book/${book.id}`}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <ContentWithPadding>
          <View style={styles.novelContainer}>
            <Text
              style={[styles.chapterTitle, { color: currentTheme.primary }]}
            >
              CHAPTER {chapter.chapterNumber}
            </Text>
            <Text
              style={[styles.chapterSubtitle, { color: currentTheme.text }]}
            >
              {chapter.title}
            </Text>
            <View
              style={[styles.divider, { backgroundColor: currentTheme.border }]}
            />
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              {chapter.content}
            </Text>

            <ChapterNavigation
              onNext={() =>
                hasNext && book.chaptersList
                  ? goToNextChapter(book.chaptersList[chapterIndex + 1])
                  : undefined
              }
              onPrev={() =>
                hasPrev && book.chaptersList
                  ? goToPrevChapter(book.chaptersList[chapterIndex - 1])
                  : undefined
              }
              hasNext={hasNext}
              hasPrev={hasPrev}
              currentChapterNumber={chapter.chapterNumber}
            />

            <View style={styles.commentsSection}>
              <TouchableOpacity
                style={styles.commentsHeader}
                onPress={() => navigateToComments(router, chapter.id)}
              >
                <View style={styles.commentsTitleContainer}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={currentTheme.primary}
                  />
                  <Text
                    style={[styles.commentsTitle, { color: currentTheme.text }]}
                  >
                    Comments ({comments.length})
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={currentTheme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ContentWithPadding>
      </ScrollView>

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
  lockedSubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  novelContainer: { marginTop: 10 },
  chapterTitle: {
    fontFamily: "Audiowide_400Regular",
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 4,
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
  commentsSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  commentsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentsTitle: { fontSize: 18, fontWeight: "600" },
});
