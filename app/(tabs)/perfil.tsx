import { useUserStore } from '@/store/userStore';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AVATAR_DEFAULT =
  'https://www.autoocupacio.org/wp-content/uploads/2017/07/Usuario-Vacio.png';

export default function PerfilScreen() {
  const { user } = useUserStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: user?.avatar || AVATAR_DEFAULT }}
          style={styles.avatar}
        />
        <Text style={[styles.username, { color: isDark ? '#fff' : '#000' }]}>
          {user?.nombreVisible ?? ''}
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

        {/* Botón de Cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  logoutButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
