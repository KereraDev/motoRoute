import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

import Header from '../../components/Home/Header';
import Stories from '../../components/Home/Stories';
import PostFeed from '../../components/Home/PostFeed';

export default function HomeScreen() {
  const colorScheme = useColorScheme(); 
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      
      <ScrollView style={styles.mainScroll}>
        <Header />
        <Stories />
        <View style={styles.separator} />
        <PostFeed />
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
