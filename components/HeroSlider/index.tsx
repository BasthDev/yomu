import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useThemeStore } from "../../store/themeStore";
import { BookItem, HeroSliderProps } from "../../utils/books";

const { width } = Dimensions.get("window");

export function HeroSlider({ data, onPress }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { currentTheme } = useThemeStore();

  const CARD_WIDTH = (width - 52) / 3;
  const COVER_HEIGHT = CARD_WIDTH * 1.3;
  const ITEM_WIDTH = width;
  const ITEM_HEIGHT = COVER_HEIGHT + 20;

  return (
    <View style={styles.container}>
      <Carousel
        loop
        autoPlay
        autoPlayInterval={6000}
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        data={data}
        pagingEnabled
        snapEnabled
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 40,
          parallaxAdjacentItemScale: 0.85,
        }}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }: { item: BookItem }) => (
          <Pressable style={styles.card} onPress={() => onPress?.(item)}>
            <View style={styles.coverWrapper}>
              <Image
                source={{ uri: item.cover }}
                style={[
                  styles.cover,
                  { width: CARD_WIDTH, height: COVER_HEIGHT },
                ]}
                resizeMode="cover"
              />
            </View>

            <View style={styles.details}>
              {item.isHot && (
                <View style={styles.hotBadge}>
                  <Ionicons name="flame" size={16} color="#fff" />
                  <Text style={styles.hotBadgeText}>HOT</Text>
                </View>
              )}
              <Text
                style={[styles.title, { color: currentTheme.text }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.author, { color: currentTheme.textSecondary }]}
                numberOfLines={1}
              >
                {item.author}
              </Text>
              <View style={styles.genreRow}>
                {item.genre.slice(0, 2).map((g, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.genreTag,
                      { borderColor: currentTheme.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.genreText,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      {g.trim()}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons
                    name="eye-outline"
                    size={14}
                    color={currentTheme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.statText,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {formatCount(item.viewsCount || 0)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons
                    name="heart-outline"
                    size={14}
                    color={currentTheme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.statText,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {formatCount(item.favoritesCount || 0)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: currentTheme.border },
                ]}
              />
              <View style={styles.chaptersInfo}>
                <Ionicons
                  name="book-outline"
                  size={14}
                  color={currentTheme.primary}
                />
                <Text
                  style={[styles.chaptersText, { color: currentTheme.text }]}
                >
                  {item.chaptersList?.length || 0} Chapters
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.pagination}>
        {data.map((_, index) => {
          const active = index === activeIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                active && styles.activeDot,
                active && { backgroundColor: currentTheme.primary },
                !active && {
                  backgroundColor: currentTheme.textSecondary + "40",
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    // marginBottom: 25,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  coverWrapper: {
    position: "relative",
  },

  cover: {
    borderRadius: 6,
  },

  hotBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E50914",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  hotBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  details: {
    flex: 1,
    gap: 6,
  },

  title: {
    fontFamily: "Lora-Bold",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },

  author: {
    fontSize: 13,
  },

  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },

  genreText: {
    fontSize: 11,
    fontWeight: "500",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    fontSize: 12,
  },

  divider: {
    height: 1,
    marginVertical: 4,
  },

  chaptersInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  chaptersText: {
    fontSize: 13,
    fontWeight: "600",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    width: 18,
  },
});
