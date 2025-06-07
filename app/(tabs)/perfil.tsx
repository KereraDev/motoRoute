import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/userStore';

export default function PerfilScreen() {
  const { user } = useUserStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={[styles.username, { color: isDark ? '#fff' : '#000' }]}>
          {user.username}
        </Text>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>
          Frase destacada:
        </Text>
        <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>
          Explorador de rutas y amante de la aventura.
        </Text>
        <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>
          Rutas creadas:
        </Text>
        <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>
          12 rutas compartidas
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  text: {
    fontSize: 15,
  },
});
