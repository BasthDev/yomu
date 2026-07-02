import { ChapterNavigation } from "@/components/ChapterNavigation";
import { Container } from "@/components/Container";
import { ContentWithPadding } from "@/components/Content";
import { CustomHeader } from "@/components/Header";
import { useSecurity } from "@/context/SecurityContext";
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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  const { comments, loadComments, addComment } = useCommentStore();
  const { balance } = useCoinStore();
  const { checkAccess, unlockWithCoins, findBookAndChapter, chapterCost } =
    useSecurity();

  const [newComment, setNewComment] = useState("");
  const [pendingUnlock, setPendingUnlock] = useState<ChapterItem | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const match = useMemo(
    () => (chapterId ? findBookAndChapter(chapterId) : null),
    [chapterId, findBookAndChapter],
  );

  const lastMatchRef = useRef(match);
  if (match) {
    lastMatchRef.current = match;
  }
  const activeMatch = match ?? lastMatchRef.current;

  const access: ChapterAccessResult | null = useMemo(
    () =>
      activeMatch ? checkAccess(activeMatch.book, activeMatch.chapter) : null,
    [activeMatch, checkAccess],
  );

  const unlockTarget = pendingUnlock ?? activeMatch?.chapter ?? null;
  const unlockAccess: ChapterAccessResult | null = useMemo(() => {
    if (!activeMatch || !unlockTarget) return null;
    return checkAccess(activeMatch.book, unlockTarget);
  }, [activeMatch, unlockTarget, checkAccess]);

  useEffect(() => {
    if (chapterId) {
      loadComments(chapterId);
    }
  }, [chapterId, loadComments]);

  useEffect(() => {
    if (!match || !access?.canAccess) return;

    updateReadingHistory(
      match.book.id,
      match.chapter.id,
      match.chapter.chapterNumber,
      match.chapter.title,
    );
  }, [chapterId, access?.canAccess, match, updateReadingHistory]);

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

  const goToNextChapter = (chapter: ChapterItem) => {
    if (!activeMatch) return;
    const nextAccess = checkAccess(activeMatch.book, chapter);
    if (nextAccess.canAccess) {
      setPendingUnlock(null);
      router.setParams({ chapterId: chapter.id });
      return;
    }
    setPendingUnlock(chapter);
  };

  const goToPrevChapter = (chapter: ChapterItem) => {
    if (!activeMatch) return;
    const prevAccess = checkAccess(activeMatch.book, chapter);
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

  if (!access?.canAccess) {
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
          title={chapter.title}
          access={access}
          balance={balance}
          chapterCost={chapterCost}
          isUnlocking={isUnlocking}
          onUnlock={handleUnlockWithCoins}
          onCancel={handleGoBack}
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

              <View
                style={[
                  styles.commentInputContainer,
                  { backgroundColor: currentTheme.surface },
                ]}
              >
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      color: currentTheme.text,
                      backgroundColor: currentTheme.background,
                    },
                  ]}
                  placeholder="Add a comment..."
                  placeholderTextColor={currentTheme.textSecondary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: currentTheme.primary },
                  ]}
                  onPress={async () => {
                    if (!newComment.trim()) return;
                    await addComment(chapter.id, newComment.trim());
                    setNewComment("");
                  }}
                  disabled={!newComment.trim()}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {comments.length > 0 && (
                <View style={styles.commentsPreview}>
                  {comments.slice(0, 3).map((comment) => (
                    <View
                      key={comment.id}
                      style={[
                        styles.commentPreviewItem,
                        { backgroundColor: currentTheme.surface },
                      ]}
                    >
                      <View
                        style={[
                          styles.commentAvatar,
                          { backgroundColor: currentTheme.primary + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.commentAvatarText,
                            { color: currentTheme.primary },
                          ]}
                        >
                          {comment.user_id.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.commentContent}>
                        <Text
                          style={[
                            styles.commentUsername,
                            { color: currentTheme.text },
                          ]}
                        >
                          User {comment.user_id.slice(-4)}
                        </Text>
                        <Text
                          style={[
                            styles.commentText,
                            { color: currentTheme.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {comment.content}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ContentWithPadding>
      </ScrollView>

      <UnlockModal
        visible={pendingUnlock !== null}
        title={unlockTarget?.title ?? "Chapter Locked"}
        access={unlockAccess}
        balance={balance}
        chapterCost={chapterCost}
        isUnlocking={isUnlocking}
        onUnlock={handleUnlockWithCoins}
        onCancel={() => setPendingUnlock(null)}
        theme={currentTheme}
      />
    </Container>
  );
}

function UnlockModal({
  visible,
  title,
  access,
  balance,
  chapterCost,
  isUnlocking,
  onUnlock,
  onCancel,
  theme,
}: {
  visible: boolean;
  title: string;
  access: ChapterAccessResult | null;
  balance: number;
  chapterCost: number;
  isUnlocking: boolean;
  onUnlock: () => void;
  onCancel: () => void;
  theme: ReturnType<typeof useThemeStore.getState>["currentTheme"];
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Chapter Locked
          </Text>
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            {title}
          </Text>

          {access?.reason === "wait_required" && (
            <View style={styles.waitInfo}>
              <Ionicons name="time" size={24} color="#ffd700" />
              <Text style={[styles.waitText, { color: theme.text }]}>
                Free in {access.daysUntilFree}{" "}
                {access.daysUntilFree === 1 ? "day" : "days"}
              </Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.coinButton]}
              onPress={onUnlock}
              disabled={isUnlocking || balance < chapterCost}
            >
              <Ionicons name="cash" size={20} color="#fff" />
              <Text style={styles.coinButtonText}>
                {isUnlocking
                  ? "Loading..."
                  : balance >= chapterCost
                    ? `Unlock ${chapterCost} Coins`
                    : `Need ${chapterCost} coins (${balance} available)`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text
              style={[styles.cancelButtonText, { color: theme.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  commentsPreview: { gap: 12 },
  commentPreviewItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: { fontSize: 16, fontWeight: "bold" },
  commentContent: { flex: 1 },
  commentUsername: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  commentText: { fontSize: 13, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: { fontSize: 16, marginBottom: 16, textAlign: "center" },
  waitInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 8,
  },
  waitText: { fontSize: 14, fontWeight: "600" },
  modalButtons: { gap: 12, marginBottom: 16 },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  coinButton: { backgroundColor: "#ffd700" },
  coinButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  cancelButton: { padding: 12, alignItems: "center" },
  cancelButtonText: { fontSize: 14 },
});
