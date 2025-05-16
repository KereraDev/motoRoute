import React from "react";
import { Text, TextProps } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function ThemedText(props: TextProps) {
  const colorScheme = useColorScheme() ?? "light";

  if (!colorScheme) return null; // ⛔️ Evita mostrar texto si no hay esquema aún

  const textColor = Colors[colorScheme].text;

  return (
    <Text {...props} style={[{ color: textColor }, props.style]}>
      {props.children}
    </Text>
  );
}
