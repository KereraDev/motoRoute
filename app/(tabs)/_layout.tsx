import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Colors } from "../../constants/Colors"; // Ruta relativa corregida
import { useColorScheme } from "../../hooks/useColorScheme"; // Ruta relativa corregida
export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
        }}
      />
    </Tabs>
  );
}
