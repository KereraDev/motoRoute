import ThemedText from "@/components/ui/ThemedText";
import { ThemeContext } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";

export default function BuscarScreen() {
  return (
    <View style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <ThemedText>Buscar</ThemedText>
    </View>
  );
}
