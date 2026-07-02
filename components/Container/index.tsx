import { View } from "react-native";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>{children}</View>
  );
}

export function ContainerWithPadding({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#121212" }}>
      {children}
    </View>
  );
}
