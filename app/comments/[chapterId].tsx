import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "../../components/Container";
import { CustomHeader } from "../../components/Header";
import { useAuthStore } from "../../store/authStore";
import { useCommentStore } from "../../store/commentStore";
import { useThemeStore } from "../../store/themeStore";
import { getRouteParam } from "../../utils/routeParams";
import { resolveCommentAuthor } from "../../utils/userDisplayName";

export default function Comments() {
  const { chapterId: chapterIdParam } = useLocalSearchParams();
  const chapterId = getRouteParam(chapterIdParam);
  const router = useRouter();
  const {
    comments,
    isLoading,
    loadCommentsWithReplies,
    addComment,
    likeComment,
    hasUserLikedComment,
    deleteComment,
  } = useCommentStore();
  const { currentTheme } = useThemeStore();
  const currentUserId = useAuthStore((s) => s.userId);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (chapterId) {
      loadCommentsWithReplies(chapterId);
    }
  }, [chapterId, loadCommentsWithReplies]);

  useEffect(() => {
    const checkLikes = async () => {
      const liked = new Set<number>();
      for (const comment of comments) {
        const isLiked = await hasUserLikedComment(comment.id);
        if (isLiked) liked.add(comment.id);
        if (comment.replies) {
          for (const reply of comment.replies) {
            const replyLiked = await hasUserLikedComment(reply.id);
            if (replyLiked) liked.add(reply.id);
          }
        }
      }
      setLikedComments(liked);
    };
    if (comments.length > 0) {
      checkLikes();
    }
  }, [comments, hasUserLikedComment]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !chapterId) return;
    await addComment(chapterId, newComment.trim(), replyingTo);
    setNewComment("");
    setReplyingTo(null);
  };

  const handleLikeComment = async (commentId: number) => {
    const liked = await likeComment(commentId);
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.add(commentId);
      } else {
        newSet.delete(commentId);
      }
      return newSet;
    });
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteComment(commentId);
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: any, isReply = false) => (
    <View
      key={comment.id}
      style={[styles.commentItem, isReply && styles.replyItem]}
    >
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text
            style={[
              styles.username,
              isReply && styles.replyUsername,
              { color: currentTheme.text },
            ]}
          >
            {resolveCommentAuthor(comment, currentUserId)}
          </Text>
          <Text
            style={[styles.timestamp, { color: currentTheme.textSecondary }]}
          >
            • {formatDate(comment.created_at)}
          </Text>
        </View>

        <Text
          style={[
            styles.commentText,
            isReply && styles.replyText,
            { color: currentTheme.text },
          ]}
        >
          {comment.content}
        </Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Ionicons
              name={likedComments.has(comment.id) ? "heart" : "heart-outline"}
              size={isReply ? 14 : 16}
              color={
                likedComments.has(comment.id)
                  ? currentTheme.primary
                  : currentTheme.textSecondary
              }
            />
            <Text
              style={[styles.actionText, { color: currentTheme.textSecondary }]}
            >
              {comment.likes_count}
            </Text>
          </TouchableOpacity>

          {!isReply && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReplyingTo(comment.id)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={currentTheme.textSecondary}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Reply
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Nested Replies Thread container */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <View
          style={[
            styles.repliesContainer,
            { borderLeftColor: currentTheme.border },
          ]}
        >
          {comment.replies.map((reply: any) => renderComment(reply, true))}
        </View>
      )}
    </View>
  );

  return (
    <Container>
      <CustomHeader title="Comments" showBack onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <Text
              style={[
                styles.loadingText,
                { color: currentTheme.textSecondary },
              ]}
            >
              Loading comments...
            </Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubble-outline"
              size={64}
              color={currentTheme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>
              No comments yet
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: currentTheme.textSecondary },
              ]}
            >
              Be the first to comment!
            </Text>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment) => renderComment(comment))}
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {replyingTo !== null && (
          <View
            style={[
              styles.replyingBar,
              {
                backgroundColor: currentTheme.surface,
                borderTopColor: currentTheme.border,
              },
            ]}
          >
            <Text style={[styles.replyingText, { color: currentTheme.text }]}>
              Replying to comment
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons
                name="close-circle"
                size={20}
                color={currentTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: currentTheme.surface,
              borderTopColor: currentTheme.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: currentTheme.text,
                backgroundColor: currentTheme.background,
              },
            ]}
            placeholder={
              replyingTo !== null ? "Write a reply..." : "Add a comment..."
            }
            placeholderTextColor={currentTheme.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            // multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: currentTheme.primary },
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: { fontSize: 14 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  commentsList: { gap: 20 },
  commentItem: { marginBottom: 4 },
  replyItem: { marginTop: 12, marginBottom: 0 },
  commentContent: { flex: 1 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: { fontSize: 14, fontWeight: "700" },
  replyUsername: { fontSize: 13, fontWeight: "600" },
  timestamp: { fontSize: 12, marginLeft: 4 },
  commentText: { fontSize: 15, lineHeight: 22, marginBottom: 6 },
  replyText: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  commentActions: { flexDirection: "row", gap: 24, alignItems: "center" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  actionText: { fontSize: 12, fontWeight: "500" },
  repliesContainer: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    gap: 4,
  },
  replyingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  replyingText: { fontSize: 12, fontWeight: "500" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
