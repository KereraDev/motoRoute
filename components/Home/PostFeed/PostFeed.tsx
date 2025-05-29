import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Post } from '../../../types/Post';
import ButtonLike from './buttonLike';
import ThemedText from '@/components/ui/ThemedText';

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
            <Image source={{ uri: post.avatar }} style={styles.avatar} />
            <ThemedText
              style={[
                styles.postUsername,
                { color: Colors[colorScheme ?? 'light'].text },
              ]}
            >
              {post.username}
            </ThemedText>
          </View>

          <Image source={{ uri: post.image }} style={styles.postImage} />

          <View style={styles.postActions}>
            <ButtonLike
              liked={post.liked ?? false}
              likes={post.likes}
              onToggle={() => onToggleLike(post.id)}
            />
            <Pressable onPress={() => console.log('Comentar')}>
              <ThemedText style={styles.icon}>💬</ThemedText>
            </Pressable>
            <Pressable onPress={() => console.log('Compartir')}>
              <ThemedText style={styles.icon}>✈️</ThemedText>
            </Pressable>
          </View>

          <View style={styles.postCaption}>
            <ThemedText style={styles.postUsername}>
              {post.username}{' '}
            </ThemedText>
            <ThemedText>{post.caption}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: { flex: 1 },
  post: { marginBottom: 15 },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  firstPostHeader: { paddingTop: 0 },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postImage: { width: '100%', height: 300 },
  postActions: {
    flexDirection: 'row',
    padding: 10,
  },
  postCaption: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  icon: { fontSize: 20, marginRight: 15 },
});
