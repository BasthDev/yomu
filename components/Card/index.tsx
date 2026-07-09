import { useBookRatingsStore } from "@/store/bookRatingsStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BookGridCardProps } from "../../utils/books";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 3;
const COVER_HEIGHT = CARD_WIDTH * 1.3;

export function BookGridCard({ item, onPress }: BookGridCardProps) {
  const { currentTheme } = useThemeStore();
  const ratings = useBookRatingsStore((state) => state.ratings);
  const rating = ratings[item.id] || 0;

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(item)}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: item.cover }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#ffcc00" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Info Container - Outside Cover */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.titleText, { color: currentTheme.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>

        <View style={styles.genreContainer}>
          {item.genre &&
            item.genre.map((g, idx) => {
              const isLast = idx === item.genre.length - 1;
              return (
                <Text
                  key={idx}
                  style={[
                    styles.genreText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  {g.trim()}
                  {!isLast ? ", " : ""}
                </Text>
              );
            })}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons
              name="eye-outline"
              size={10}
              color={currentTheme.textSecondary}
            />
            <Text
              style={[styles.statText, { color: currentTheme.textSecondary }]}
            >
              {formatCount(item.viewsCount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="heart-outline"
              size={10}
              color={currentTheme.textSecondary}
            />
            <Text
              style={[styles.statText, { color: currentTheme.textSecondary }]}
            >
              {formatCount(item.favoritesCount)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  coverContainer: {
    width: CARD_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
    marginBottom: 8,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    // paddingHorizontal: 4,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 4,
  },
  genreText: {
    fontSize: 10,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  statText: {
    fontSize: 9,
  },
  titleText: {
    // marginTop: -5,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 15,
    fontFamily: "Lora-Bold",
  },
});
