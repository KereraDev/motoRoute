import ThemedText from '@/components/ui/ThemedText';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useColorScheme } from '../../../hooks/useColorScheme';

export default function Header() {
  const colorScheme = useColorScheme();
  const { user } = useUserStore();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />

      <ThemedText
        style={[
          styles.headerTitle,
          { color: colorScheme === 'dark' ? '#ffffff' : '#000000' },
        ]}
      >
        Hola, {user.username}!
      </ThemedText>

      <Pressable
        onPress={() => router.push('/amigos')}
        style={({ hovered, pressed }) => [
          styles.iconButton,
          (hovered || pressed) && styles.iconButtonHover,
        ]}
      >
        <Ionicons name="paper-plane" size={20} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  iconButton: {
    padding: 8,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonHover: {
    backgroundColor: '#e6e6e6',
  },
});
