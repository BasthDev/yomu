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
import { getRouteParam } from "../../utils/routeParams";
import { useCommentStore } from "../../store/commentStore";
import { useThemeStore } from "../../store/themeStore";

export default function Comments() {
  const { chapterId: chapterIdParam } = useLocalSearchParams();
  const chapterId = getRouteParam(chapterIdParam);
  const router = useRouter();
  const { comments, isLoading, loadComments, addComment, likeComment, deleteComment } =
    useCommentStore();
  const { currentTheme } = useThemeStore();
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (chapterId) {
      loadComments(chapterId);
    }
  }, [chapterId, loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !chapterId) return;
    await addComment(chapterId, newComment.trim());
    setNewComment("");
  };

  const handleLikeComment = async (commentId: number) => {
    await likeComment(commentId);
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteComment(commentId);
        },
      },
    ]);
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

  return (
    <Container>
      <CustomHeader title="Comments" showBack onBack={() => router.back()} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.centered}>
              <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
                Loading comments...
              </Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={64} color="#333" />
              <Text style={[styles.emptyText, { color: currentTheme.text }]}>No comments yet</Text>
              <Text style={[styles.emptySubtext, { color: currentTheme.textSecondary }]}>
                Be the first to comment!
              </Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((comment) => (
                <View
                  key={comment.id}
                  style={[styles.commentItem, { backgroundColor: currentTheme.surface }]}
                >
                  <View style={styles.commentHeader}>
                    <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
                      <Text style={styles.avatarText}>
                        {comment.user_id.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentMeta}>
                      <Text style={[styles.username, { color: currentTheme.text }]}>
                        User {comment.user_id.slice(-4)}
                      </Text>
                      <Text style={[styles.timestamp, { color: currentTheme.textSecondary }]}>
                        {formatDate(comment.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.commentContent, { color: currentTheme.text }]}>
                    {comment.content}
                  </Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLikeComment(comment.id)}
                    >
                      <Ionicons name="heart-outline" size={18} color={currentTheme.textSecondary} />
                      <Text style={[styles.actionText, { color: currentTheme.textSecondary }]}>
                        {comment.likes_count}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteComment(comment.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E50914" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: currentTheme.surface }]}>
          <TextInput
            style={[styles.input, { color: currentTheme.text, backgroundColor: currentTheme.background }]}
            placeholder="Add a comment..."
            placeholderTextColor={currentTheme.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: currentTheme.primary }]}
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
  content: { padding: 16, paddingBottom: 80 },
  centered: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  loadingText: { fontSize: 14 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  commentsList: { gap: 12 },
  commentItem: { borderRadius: 12, padding: 16 },
  commentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  commentMeta: { flex: 1 },
  username: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  timestamp: { fontSize: 12 },
  commentContent: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  commentActions: { flexDirection: "row", gap: 16 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
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
