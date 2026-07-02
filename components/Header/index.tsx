import { useThemeStore } from "@/store/themeStore";
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
  onBack?: () => void;
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

  const handleLogoPress = () => {
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <VectorIcons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        ) : (
          /* 
            Kuncinya di sini: Logo YOMU hanya akan muncul 
            jika properti 'title' tidak diisi (!title)
          */
          !title && (
            <TouchableOpacity onPress={handleLogoPress}>
              <Text style={[styles.logo, { color: currentTheme.primary }]}>
                YOMU
              </Text>
            </TouchableOpacity>
          )
        )}

        {/* Jika judul ada, teks akan otomatis mengisi ruang kiri yang kosong */}
        {title && (
          <Text
            style={[styles.title, { color: currentTheme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        )}

        <View style={styles.rightIcons}>
          {!hideIcons && <></>}
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
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    // Diubah menjadi left agar posisi judul rapi di sebelah tombol back
    // atau di pojok kiri saat logo YOMU bersembunyi
    textAlign: "left",
    marginLeft: 8,
    paddingVertical: 8.5,
  },
  iconButton: {
    padding: 4,
    marginLeft: -4, // Geser sedikit ke kiri agar sejajar dengan margin container
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
