import { create } from "zustand";
import {
    ColorTheme,
    defaultTheme,
    lightPresetThemes,
    presetThemes,
} from "../utils/colortheme";
import * as Database from "../utils/database";

interface ThemeState {
  currentTheme: ColorTheme;
  themeName: string;
  colorMode: "dark" | "light";
  isLoading: boolean;
  loadTheme: () => Promise<void>;
  setTheme: (theme: ColorTheme) => Promise<void>;
  setPresetTheme: (themeName: string) => Promise<void>;
  setColorMode: (mode: "dark" | "light") => Promise<void>;
  resetTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: defaultTheme,
  themeName: "default",
  colorMode: "dark",
  isLoading: true,

  loadTheme: async () => {
    try {
      const savedThemeName = await Database.getSetting("theme_name");
      const savedColorMode = await Database.getSetting("color_mode");

      const colorMode = (savedColorMode as "dark" | "light") || "dark";
      const themes = colorMode === "light" ? lightPresetThemes : presetThemes;

      if (savedThemeName && themes[savedThemeName]) {
        set({
          currentTheme: themes[savedThemeName],
          themeName: savedThemeName,
          colorMode,
          isLoading: false,
        });
      } else {
        set({
          currentTheme: themes.default,
          themeName: "default",
          colorMode,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error loading theme:", error);
      set({ isLoading: false });
    }
  },

  setTheme: async (theme: ColorTheme) => {
    set({ currentTheme: theme, themeName: "custom" });
    // Note: Custom themes would need to be serialized to JSON
    // For now, we only persist preset themes
  },

  setPresetTheme: async (themeName: string) => {
    const { colorMode } = get();
    const themes = colorMode === "light" ? lightPresetThemes : presetThemes;
    const theme = themes[themeName] || themes.default;
    set({ currentTheme: theme, themeName });
    await Database.setSetting("theme_name", themeName);
  },

  setColorMode: async (mode: "dark" | "light") => {
    const themes = mode === "light" ? lightPresetThemes : presetThemes;
    const { themeName } = get();
    const theme = themes[themeName] || themes.default;

    set({
      currentTheme: theme,
      colorMode: mode,
    });
    await Database.setSetting("color_mode", mode);
  },

  resetTheme: async () => {
    const { colorMode } = get();
    const themes = colorMode === "light" ? lightPresetThemes : presetThemes;
    set({ currentTheme: themes.default, themeName: "default" });
    await Database.setSetting("theme_name", "default");
  },
}));
