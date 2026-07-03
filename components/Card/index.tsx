import { useBookRatingsStore } from "@/store/bookRatingsStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 44) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export function BookGridCard({ item, onPress }: BookGridCardProps) {
  const { currentTheme } = useThemeStore();
  const getRating = useBookRatingsStore((state) => state.getRating);
  const rating = getRating(item.id);

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(item)}>
      {/* Gambar Sampul Buku */}
      <Image
        source={{ uri: item.cover }}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* Gradien Pelindung Kontras Teks */}
      <LinearGradient
        colors={["transparent", "rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.9)"]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      />

      {/* Indikator Rating Bintang di Pojok Kiri Atas Kartu */}
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={10} color="#ffcc00" />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>

      {/* Area Informasi Buku (Bawah) */}
      <View style={styles.infoContainer}>
        {/* 
          KUNCINYA DI SINI: Menggunakan kontainer row dengan flexWrap 
          agar teks otomatis patah membuat baris baru di bawahnya jika tidak muat.
        */}
        <View style={styles.genreContainer}>
          {item.genre &&
            item.genre.map((g, idx) => {
              // Menentukan apakah ini kata genre terakhir dalam daftar array
              const isLast = idx === item.genre.length - 1;
              return (
                <Text
                  key={idx}
                  style={[styles.genreText, { color: currentTheme.primary }]}
                >
                  {g.trim()}
                  {!isLast ? ", " : ""}
                </Text>
              );
            })}
        </View>

        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
    marginBottom: 12,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },

  // Kontainer Baru untuk Membungkus Genre
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Ini yang memaksa teks membuat baris baru ke bawah saat mentok kanan
    alignItems: "center",
    marginBottom: 6,
  },
  genreText: {
    color: "red", // Warna tema merah Yomu Anda
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    lineHeight: 14, // Jarak vertikal antar baris kata agar tidak tumpang tindih
  },
  titleText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 18,
  },
});
