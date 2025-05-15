import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import { Post } from "../../../types/Post";
import ButtonLike from "./buttonLike";

type PostFeedProps = {
  posts: Post[];
  onToggleLike: (id: string) => void;
  onOpenComments: (postId: string) => void;
};

export default function PostFeed({ posts, onToggleLike }: PostFeedProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.postsContainer}>
      {posts.map((post, index) => (
        <View key={post.id} style={styles.post}>
          <View
            style={[styles.postHeader, index === 0 && styles.firstPostHeader]}
          >
            <Text
              style={[
                styles.postUsername,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
            >
              {post.username}
            </Text>
          </View>

          <Image source={{ uri: post.image }} style={styles.postImage} />

          <View style={styles.postActions}>
            <ButtonLike
              liked={post.liked ?? false}
              likes={post.likes}
              onToggle={() => onToggleLike(post.id)}
            />
            <Pressable onPress={() => console.log("Comentar")}>
              <Text style={styles.icon}>💬</Text>
            </Pressable>
            <Pressable onPress={() => console.log("Compartir")}>
              <Text style={styles.icon}>✈️</Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.postCaption,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            <Text style={styles.postUsername}>{post.username}</Text>{" "}
            {post.caption}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: { flex: 1 },
  post: { marginBottom: 15 },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  firstPostHeader: { paddingTop: 0 },
  postUsername: { fontWeight: "bold", fontSize: 14 },
  postImage: { width: "100%", height: 300 },
  postActions: { flexDirection: "row", padding: 10 },
  postCaption: { paddingHorizontal: 10, paddingBottom: 5 },
  icon: { fontSize: 20, marginRight: 15 },
});
