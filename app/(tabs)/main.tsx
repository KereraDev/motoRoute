// app/main.tsx
import { useTabIndexStore } from '@/store/tabIndexStore';
import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { TabView } from 'react-native-tab-view';
import AmigosScreen from '../friends';
import HomeScreen from './home';
export default function MainSwipeTabs() {
  const layout = useWindowDimensions();
  const index = useTabIndexStore(state => state.index);
  const setIndex = useTabIndexStore(state => state.setIndex);

  const [routes] = useState([
    { key: 'home', title: 'Home' },
    { key: 'friends', title: 'friends' },
  ]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen />;
      case 'friends':
        return <AmigosScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled
        lazy
        renderTabBar={() => null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
