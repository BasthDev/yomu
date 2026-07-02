import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
// 1. Mengimpor tipe data resmi terpusat dari proyek Anda
import { useThemeStore } from "../../store/themeStore";
import { BookItem, HeroSliderProps } from "../../utils/books";

const { width } = Dimensions.get("window");

export function HeroSlider({ data, onPress }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { currentTheme } = useThemeStore();

  const ITEM_WIDTH = width;
  const ITEM_HEIGHT = 280;

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
          parallaxScrollingScale: 0.95,
          parallaxScrollingOffset: 40,
          parallaxAdjacentItemScale: 0.85,
        }}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }: { item: BookItem }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.banner }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Gradien pelindung teks agar kontras */}
            <LinearGradient
              colors={[
                "transparent",
                "rgba(0, 0, 0, 0.4)",
                "rgba(0, 0, 0, 0.85)",
              ]}
              locations={[0, 0.4, 1]}
              style={styles.overlayGradient}
            />

            {/* Konten Informasi Novel */}
            <View style={styles.content}>
              <View style={styles.topMeta}>
                {item.isHot && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>HOT NOVEL</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.title,
                  item.title.length > 16 && styles.titleMedium,
                  item.title.length > 28 && styles.titleSmall,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {/* 2. Diperbarui: Melakukan map langsung dari array genre bawaan tipe baru */}
              <View style={styles.genreRow}>
                {item.genre.map((g, idx) => (
                  <View key={idx} style={styles.genreTag}>
                    <Text style={styles.genreText}>{g.trim()}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  styles.playButton,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={() => onPress?.(item)}
              >
                <Ionicons name="book" size={18} color="#fff" />
                <Text style={styles.playButtonText}>Read Now</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Indikator Halaman (Dots) */}
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
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 25,
  },

  card: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
  },

  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: 25,
  },

  topMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  title: {
    fontFamily: "Audiowide_400Regular",
    color: "#fff",
    fontSize: 26,
    letterSpacing: 0.5,
    lineHeight: 34,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  titleMedium: {
    fontSize: 22,
    lineHeight: 28,
  },

  titleSmall: {
    fontSize: 18,
    lineHeight: 24,
  },

  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
  },

  genreTag: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },

  genreText: {
    color: "red",
    fontSize: 11,
    fontWeight: "600",
  },

  playButton: {
    backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },

  playButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -12,
    width: "100%",
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  activeDot: {
    width: 18,
    backgroundColor: "red",
  },
});
