export interface ColorTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

const darkTheme: ColorTheme = {
  primary: "#E50914", // Netflix Red
  primaryLight: "#FF1A2D",
  primaryDark: "#B3070F",
  secondary: "#2196F3", // Blue
  accent: "#FF9800", // Orange
  background: "#121212", // Dark background
  surface: "#1E1E1E", // Card/surface background
  text: "#FFFFFF", // Primary text
  textSecondary: "#888888", // Secondary text
  textTertiary: "#666666", // Tertiary text
  border: "rgba(255, 255, 255, 0.1)", // Border color
  success: "#4CAF50", // Green
  warning: "#FFC107", // Yellow
  error: "#F44336", // Red
};

const lightTheme: ColorTheme = {
  primary: "#E50914", // Netflix Red
  primaryLight: "#FF1A2D",
  primaryDark: "#B3070F",
  secondary: "#2196F3", // Blue
  accent: "#FF9800", // Orange
  background: "#FFFFFF", // Light background
  surface: "#F5F5F5", // Card/surface background
  text: "#000000", // Primary text
  textSecondary: "#666666", // Secondary text
  textTertiary: "#999999", // Tertiary text
  border: "rgba(0, 0, 0, 0.1)", // Border color
  success: "#4CAF50", // Green
  warning: "#FFC107", // Yellow
  error: "#F44336", // Red
};

export const defaultTheme: ColorTheme = darkTheme;

export const presetThemes: Record<string, ColorTheme> = {
  default: darkTheme,
  red: {
    ...darkTheme,
    primary: "#E50914",
    primaryLight: "#FF1A2D",
    primaryDark: "#B3070F",
  },
  blue: {
    ...darkTheme,
    primary: "#2196F3",
    primaryLight: "#42A5F5",
    primaryDark: "#1976D2",
  },
  green: {
    ...darkTheme,
    primary: "#4CAF50",
    primaryLight: "#66BB6A",
    primaryDark: "#388E3C",
  },
  purple: {
    ...darkTheme,
    primary: "#9C27B0",
    primaryLight: "#BA68C8",
    primaryDark: "#7B1FA2",
  },
  orange: {
    ...darkTheme,
    primary: "#FF9800",
    primaryLight: "#FFB74D",
    primaryDark: "#F57C00",
  },
  pink: {
    ...darkTheme,
    primary: "#E91E63",
    primaryLight: "#F06292",
    primaryDark: "#C2185B",
  },
  teal: {
    ...darkTheme,
    primary: "#009688",
    primaryLight: "#4DB6AC",
    primaryDark: "#00796B",
  },
  gold: {
    ...darkTheme,
    primary: "#FFD700",
    primaryLight: "#FFEC8B",
    primaryDark: "#DAA520",
  },
};

export const lightPresetThemes: Record<string, ColorTheme> = {
  default: lightTheme,
  red: {
    ...lightTheme,
    primary: "#E50914",
    primaryLight: "#FF1A2D",
    primaryDark: "#B3070F",
  },
  blue: {
    ...lightTheme,
    primary: "#2196F3",
    primaryLight: "#42A5F5",
    primaryDark: "#1976D2",
  },
  green: {
    ...lightTheme,
    primary: "#4CAF50",
    primaryLight: "#66BB6A",
    primaryDark: "#388E3C",
  },
  purple: {
    ...lightTheme,
    primary: "#9C27B0",
    primaryLight: "#BA68C8",
    primaryDark: "#7B1FA2",
  },
  orange: {
    ...lightTheme,
    primary: "#FF9800",
    primaryLight: "#FFB74D",
    primaryDark: "#F57C00",
  },
  pink: {
    ...lightTheme,
    primary: "#E91E63",
    primaryLight: "#F06292",
    primaryDark: "#C2185B",
  },
  teal: {
    ...lightTheme,
    primary: "#009688",
    primaryLight: "#4DB6AC",
    primaryDark: "#00796B",
  },
  gold: {
    ...lightTheme,
    primary: "#FFD700",
    primaryLight: "#FFEC8B",
    primaryDark: "#DAA520",
  },
};
