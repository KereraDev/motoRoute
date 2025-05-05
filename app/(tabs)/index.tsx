import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

import Header from '@/components/Home/Header/Header';
import Stories from '@/components/Home/Stories/Stories';
import PostFeed from '@/components/Home/PostFeed/PostFeed';
import CreatePost from '@/components/Home/PostFeed/CreatePost';
import CommentsSheet from '@/components/Home/PostFeed/Comments/CommentsSheet';
import { useCommentsSheet } from '@/components/Home/PostFeed/Comments/useCommentsSheet';
import { Post, NewPostInput } from '../../types/Post';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState<Post[]>([]);

  // 🔁 Crear post
  const handleNewPost = (data: NewPostInput) => {
    const newPost: Post = {
      id: Date.now().toString(),
      username: 'current_user',
      image: data.imageUri ?? 'https://via.placeholder.com/300',
      likes: 0,
      caption: data.text,
      liked: false,
      comments: [], // 💬 inicializa vacío
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  // ❤️ Like
  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  // 💬 Agregar comentario
  const handleAddComment = (postId: string, comment: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [...(post.comments ?? []), comment],
            }
          : post
      )
    );
  };

  // 🎣 Hook para manejar el Bottom Sheet
  const {
    bottomSheetRef,
    activePostId,
    openComments,
    closeComments,
  } = useCommentsSheet();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ? 'dark' : 'light'].background }]}>
      <Header />
      <ScrollView style={styles.mainScroll}>
        <Stories />
        <View style={styles.separator} />
        <CreatePost onPostCreated={handleNewPost} />
        <View style={styles.separator} />
        <PostFeed posts={posts} onToggleLike={toggleLike} onOpenComments={openComments} />
      </ScrollView>

      {/* 💬 Comments Bottom Sheet */}
      <CommentsSheet
        bottomSheetRef={bottomSheetRef}
        activePostId={activePostId}
        posts={posts}
        onAddComment={handleAddComment}
      />
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
