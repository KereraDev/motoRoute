import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import Header from "@/components/Home/Header/Header";
import Stories from "@/components/Home/Stories/Stories";
import PostFeed from "@/components/Home/PostFeed/PostFeed";
import { usePostStore } from "@/store/postStore";

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const posts = usePostStore((state) => state.posts);
  const toggleLike = usePostStore((state) => state.toggleLike);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            Colors[colorScheme === "dark" ? "dark" : "light"].background,
        },
      ]}
    >
      <Header />

      <ScrollView style={styles.mainScroll}>
        <Stories />
        <View style={styles.separator} />
        <PostFeed
          posts={posts}
          onToggleLike={toggleLike}
          onOpenComments={(postId) =>
            console.log("Abrir comentarios de:", postId)
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainScroll: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
});
