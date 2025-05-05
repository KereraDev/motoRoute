import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';
import { useState } from 'react';

import Header from '../../components/Home/Header';
import Stories from '../../components/Home/Stories';
import PostFeed from '../../components/Home/PostFeed';
import CreatePost from '../../components/Home/CreatePost';
import { Post, NewPostInput } from '../../types/Post';




export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState<Post[]>([]);

  const handleNewPost = (data: NewPostInput) => {
    const newPost: Post = {
      id: Date.now().toString(), // o uuid
      username: 'current_user',
      image: data.imageUri ?? 'https://via.placeholder.com/300',
      likes: 0,
      caption: data.text,
    };
  
    setPosts([newPost, ...posts]);
  };
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Header />
      <ScrollView style={styles.mainScroll}>
        <Stories />
        <View style={styles.separator} />
        <CreatePost onPostCreated={handleNewPost} />
        <View style={styles.separator} />
        <PostFeed posts={posts} />
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
