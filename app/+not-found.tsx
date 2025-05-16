import ThemedText from "@/components/ui/ThemedText";
import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text, Pressable } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <ThemedText style={styles.title}>Esta pantalla no existe.</ThemedText>
        <Link href="/" asChild>
          <Pressable style={styles.link}>
            <ThemedText style={styles.linkText}>
              Ir a la pantalla principal
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
