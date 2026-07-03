import { View } from "react-native";
import { useThemeStore } from "../../store/themeStore";

export function Container({ children }: { children: React.ReactNode }) {
  const { currentTheme } = useThemeStore();
  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      {children}
    </View>
  );
}

export function ContainerWithPadding({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTheme } = useThemeStore();
  return (
    <View
      style={{ flex: 1, padding: 16, backgroundColor: currentTheme.background }}
    >
      {children}
    </View>
  );
}
