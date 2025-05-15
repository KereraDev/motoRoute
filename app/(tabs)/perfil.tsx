import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/100" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>usuario</Text>
      <Text style={styles.username}>@usuario</Text>
      <Text style={styles.bio}>Lorep Insum</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  username: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  bio: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
});
