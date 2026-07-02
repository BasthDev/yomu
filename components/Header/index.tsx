import { useCoinStore } from "@/store/coinStore";
import { useThemeStore } from "@/store/themeStore";
import { navigateToWallet } from "@/utils/navigation";
import { Ionicons as VectorIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
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
            <VectorIcons name="chevron-back" size={28} color="#fff" />
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
              style={styles.balancePill}
              onPress={handleWalletPress}
            >
              <VectorIcons name="cash" size={16} color="#ffd700" />
              <Text style={styles.balanceText}>
                {balanceLoading ? "…" : balance}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.profilePic}>
            <VectorIcons name="person-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <VectorIcons
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search movies, TV shows..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={onSearchChange}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={onFilterPress}
            >
              <VectorIcons name="options-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {selectedFilters.length > 0 && (
            <View style={styles.chipsContainer}>
              {selectedFilters.map((filter) => (
                <View key={filter} style={styles.chip}>
                  <Text style={styles.chipText}>{filter}</Text>
                  <TouchableOpacity onPress={() => onRemoveFilter?.(filter)}>
                    <VectorIcons
                      name="close-circle"
                      size={16}
                      color="#E50914"
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
    backgroundColor: "rgba(255, 215, 0, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.25)",
  },
  balanceText: {
    color: "#ffd700",
    fontSize: 13,
    fontWeight: "700",
  },
  profilePic: {
    borderRadius: 16,
    overflow: "hidden",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  filterButton: {
    width: 46,
    height: 46,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
    backgroundColor: "rgba(229, 9, 20, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(229, 9, 20, 0.3)",
    gap: 6,
  },
  chipText: {
    color: "#fff",
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
