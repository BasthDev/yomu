import { useAuthStore } from "@/store/authStore";
import { useCoinStore } from "@/store/coinStore";
import { useThemeStore } from "@/store/themeStore";
import { navigateToWallet } from "@/utils/navigation";
import { Ionicons as VectorIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomHeaderProps {
  showBack?: boolean;
  onBack?: (navigation: any) => void;
  forceBackPath?: string; // TAMBAHAN: Rute paksa absolut (misal: `/book/${currentBook.id}`)
  title?: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  onFilterPress?: () => void;
  selectedFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  notificationsCount?: number;
  hideIcons?: boolean;
}

export function CustomHeader({
  showBack,
  onBack,
  forceBackPath, // Ambil properti forceBackPath baru
  title,
  showSearch,
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onFilterPress,
  selectedFilters = [],
  onRemoveFilter,
  notificationsCount = 0,
  hideIcons = false,
}: CustomHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTheme } = useThemeStore();
  const balance = useCoinStore((state) => state.balance);
  const balanceLoading = useCoinStore((state) => state.isLoading);
  const { firstName, email, imageUrl } = useAuthStore();

  const handleLogoPress = () => {
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleWalletPress = () => {
    navigateToWallet(router);
  };

  // Logika interseptor tombol kembali otomatis
  const handlePressBack = () => {
    if (forceBackPath) {
      // 1. Menggunakan router.replace untuk menghancurkan riwayat tumpukan halaman di atasnya
      router.back();
      return;
    }
    if (onBack) {
      onBack(router);
      return;
    }
    router.back();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={handlePressBack} style={styles.iconButton}>
            <VectorIcons
              name="chevron-back"
              size={28}
              color={currentTheme.text}
            />
          </TouchableOpacity>
        ) : (
          !title && (
            <TouchableOpacity onPress={handleLogoPress}>
              <Text style={[styles.logo, { color: currentTheme.primary }]}>
                YOMU
              </Text>
            </TouchableOpacity>
          )
        )}

        {/* 
          PERBAIKAN KONTRAST TEKS: Judul dibungkus dengan titleContainer 
          agar elipsis (...) terpicu rapi sebelum menabrak saldo koin / ikon kanan
        */}
        {title && (
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { color: currentTheme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>
        )}

        <View style={styles.rightIcons}>
          {!hideIcons && (
            <TouchableOpacity
              style={[
                styles.balancePill,
                {
                  backgroundColor: currentTheme.warning + "20",
                  borderColor: currentTheme.warning + "40",
                },
              ]}
              onPress={handleWalletPress}
            >
              <VectorIcons name="cash" size={16} color={currentTheme.warning} />
              <Text
                style={[styles.balanceText, { color: currentTheme.warning }]}
              >
                {balanceLoading ? "…" : balance}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.profilePic}
            onPress={() => router.push("/(tabs)/profile")}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profileImage} />
            ) : (
              <View
                style={[
                  styles.profileFallback,
                  { backgroundColor: currentTheme.primary },
                ]}
              >
                <Text style={styles.profileFallbackText}>
                  {firstName?.[0]?.toUpperCase() ||
                    email?.[0]?.toUpperCase() ||
                    "U"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View>
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <VectorIcons
                name="search"
                size={20}
                color={currentTheme.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: currentTheme.text }]}
                placeholder="Search movies, TV shows..."
                placeholderTextColor={currentTheme.textSecondary}
                value={searchQuery}
                onChangeText={onSearchChange}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                },
              ]}
              onPress={onFilterPress}
            >
              <VectorIcons
                name="options-outline"
                size={20}
                color={currentTheme.text}
              />
            </TouchableOpacity>
          </View>

          {selectedFilters.length > 0 && (
            <View style={styles.chipsContainer}>
              {selectedFilters.map((filter) => (
                <View
                  key={filter}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: currentTheme.primary + "20",
                      borderColor: currentTheme.primary + "40",
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: currentTheme.text }]}>
                    {filter}
                  </Text>
                  <TouchableOpacity onPress={() => onRemoveFilter?.(filter)}>
                    <VectorIcons
                      name="close-circle"
                      size={16}
                      color={currentTheme.primary}
                      style={styles.chipCloseIcon}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#121212",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "Audiowide_400Regular",
    fontSize: 32,
    color: "#E50914",
  },
  // Mengunci ruang area tengah judul agar elipsis berjalan sempurna
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "left",
    marginLeft: 8,
    paddingVertical: 8.5,
  },
  iconButton: {
    padding: 4,
    marginLeft: -4,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: "700",
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  profileFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileFallbackText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipCloseIcon: {
    marginLeft: 2,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E50914",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
});
