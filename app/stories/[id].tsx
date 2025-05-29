import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '@/components/ui/ThemedText';

export default function StoryScreen() {
  const { id, image } = useLocalSearchParams();
  const router = useRouter();

  const decodedImage = image ? decodeURIComponent(image as string) : null;

  return (
    <View style={styles.container}>
      {decodedImage ? (
        <Image source={{ uri: decodedImage }} style={styles.image} />
      ) : (
        <ThemedText style={styles.storyText}>Historia ID: {id}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  storyText: {
    color: '#fff',
    fontSize: 24,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
