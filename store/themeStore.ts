import { create } from "zustand";
import { ColorTheme, defaultTheme, presetThemes } from "../utils/colortheme";
import * as Database from "../utils/database";

interface ThemeState {
  currentTheme: ColorTheme;
  themeName: string;
  isLoading: boolean;
  loadTheme: () => Promise<void>;
  setTheme: (theme: ColorTheme) => Promise<void>;
  setPresetTheme: (themeName: string) => Promise<void>;
  resetTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: defaultTheme,
  themeName: "default",
  isLoading: true,

  loadTheme: async () => {
    try {
      const savedThemeName = await Database.getSetting("theme_name");
      if (savedThemeName && presetThemes[savedThemeName]) {
        set({
          currentTheme: presetThemes[savedThemeName],
          themeName: savedThemeName,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
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
    const theme = presetThemes[themeName] || defaultTheme;
    set({ currentTheme: theme, themeName });
    await Database.setSetting("theme_name", themeName);
  },

  resetTheme: async () => {
    set({ currentTheme: defaultTheme, themeName: "default" });
    await Database.setSetting("theme_name", "default");
  },
}));
