import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

type Story = {
  id: string;
  username: string;
};

const stories: Story[] = [
  { id: '1', username: 'usuario1' },
  { id: '2', username: 'usuario2' },
  { id: '3', username: 'usuario3' },
  { id: '4', username: 'usuario4' },
  { id: '5', username: 'usuario5' },
  { id: '6', username: 'usuario6' },
  { id: '7', username: 'usuario7' },
  { id: '8', username: 'usuario8' },
  { id: '9', username: 'usuario9' },
  { id: '10', username: 'usuario10' },
  { id: '11', username: 'usuario11' },
];

export default function Stories() {
  const colorScheme = useColorScheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
      contentContainerStyle={styles.storiesContent}
    >
      {stories.map((story) => (
        <View key={story.id} style={styles.story}>
          <View style={styles.storyCircle}>
            <Text style={styles.storyText}>{story.username[0]}</Text>
          </View>
          <Text
            style={[
              styles.storyUsername,
              { color: Colors[colorScheme].text },
            ]}
            numberOfLines={1}
          >
            {story.username}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  storiesContainer: {
    paddingVertical: 8,
  },
  storiesContent: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  story: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f09433',
  },
  storyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 5,
    maxWidth: 60,
  },
});
