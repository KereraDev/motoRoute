import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useRutasFeed } from '../../hooks/useRutasFeed';
import Header from '@/components/Home/Header/Header';
import PostFeed from '@/components/Home/PostFeed/PostFeed';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { posts, loading } = useRutasFeed();

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
      <View style={styles.separator} />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#008000"
          style={{ marginTop: 40 }}
        />
      ) : (
        <PostFeed posts={posts} onToggleLike={() => {}} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  separator: { height: 10 },
});