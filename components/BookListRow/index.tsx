import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeStore } from "../../store/themeStore";
import { BookItem } from "../../utils/books";

interface BookListRowProps {
  book: BookItem;
  commentCount?: number;
  onPress: (book: BookItem) => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function BookListRow({
  book,
  commentCount = 0,
  onPress,
}: BookListRowProps) {
  const { currentTheme } = useThemeStore();

  return (
    <Pressable
      style={[
        styles.row,
        {
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        },
      ]}
      onPress={() => onPress(book)}
    >
      <Image
        source={{ uri: book.cover }}
        style={styles.cover}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text
          style={[styles.title, { color: currentTheme.text }]}
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text
          style={[styles.author, { color: currentTheme.textSecondary }]}
          numberOfLines={1}
        >
          {book.author} · {book.genre.join(", ")}
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons
              name="eye-outline"
              size={12}
              color={currentTheme.textSecondary}
            />
            <Text
              style={[styles.statText, { color: currentTheme.textSecondary }]}
            >
              {formatCount(book.viewsCount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="heart-outline"
              size={12}
              color={currentTheme.textSecondary}
            />
            <Text
              style={[styles.statText, { color: currentTheme.textSecondary }]}
            >
              {formatCount(book.favoritesCount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="chatbubble-outline"
              size={12}
              color={currentTheme.textSecondary}
            />
            <Text
              style={[styles.statText, { color: currentTheme.textSecondary }]}
            >
              {formatCount(commentCount)}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={currentTheme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    height: 76,
  },
  cover: {
    width: 44,
    height: 56,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  author: {
    fontSize: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 11,
  },
});
