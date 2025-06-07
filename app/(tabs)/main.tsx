// app/main.tsx
import React, { useState } from 'react';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import HomeScreen from './home';
import AmigosScreen from '../amigos';
import { useTabIndexStore } from '@/store/tabIndexStore';
export default function MainSwipeTabs() {
  const layout = useWindowDimensions();
  const index = useTabIndexStore(state => state.index);
  const setIndex = useTabIndexStore(state => state.setIndex);

  const [routes] = useState([
    { key: 'home', title: 'Home' },
    { key: 'amigos', title: 'Amigos' },
  ]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'home':
        return <HomeScreen />;
      case 'amigos':
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
