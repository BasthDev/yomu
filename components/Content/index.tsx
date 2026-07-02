import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

// 1. Definisikan interface props agar menerima children dan style opsional
interface ContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; // Menerima tipe data style View bawaan React Native
}

export function Content({ children, style }: ContentProps) {
  return (
    /* 
      2. Menggabungkan gaya default { flex: 1 } dengan style ekstra 
         yang dikirim dari komponen luar menggunakan array style
    */
    <View style={[{ flex: 1 }, style]}>{children}</View>
  );
}

export function ContentWithPadding({ children, style }: ContentProps) {
  return (
    /* 
      3. Menggabungkan gaya default padding dengan style ekstra dari luar
    */
    <View style={[{ flex: 1, padding: 16 }, style]}>{children}</View>
  );
}
