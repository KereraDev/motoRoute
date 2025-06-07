import Header from '@/components/Home/Header/Header';
import PostFeed from '@/components/Home/PostFeed/PostFeed';
import { usePostStore } from '@/store/postStore';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const posts = usePostStore(state => state.posts);
  const toggleLike = usePostStore(state => state.toggleLike);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            Colors[colorScheme === 'dark' ? 'dark' : 'light'].background,
        },
      ]}
    >
      <Header />

      <ScrollView style={styles.mainScroll}>
        <View style={styles.separator} />
        <PostFeed posts={posts} onToggleLike={toggleLike} />
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
