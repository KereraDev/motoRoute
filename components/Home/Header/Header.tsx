import ThemedText from '@/components/ui/ThemedText';
import { useTabIndexStore } from '@/store/tabIndexStore';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useColorScheme } from '../../../hooks/useColorScheme';

// Importa ambas versiones del logo
const logoLight = require('../../../assets/images/logo-dark.png'); // para fondo oscuro
const logoDark = require('../../../assets/images/logo-light.png');

export default function Header() {
  const colorScheme = useColorScheme();
  const { user } = useUserStore();
  const setIndex = useTabIndexStore(state => state.setIndex);

  return (
    <View style={styles.header}>
      {/* Logo que cambia según el modo */}
      <Image
        source={colorScheme === 'dark' ? logoLight : logoDark}
        style={styles.logo}
      />

      <ThemedText
        style={[
          styles.headerTitle,
          { color: colorScheme === 'dark' ? '#ffffff' : '#000000' },
        ]}
      >
        Hola, {user.username} !
      </ThemedText>

      <Pressable
        onPress={() => setIndex(1)}
        style={({ hovered, pressed }) => [
          styles.iconButton,
          (hovered || pressed) && styles.iconButtonHover,
        ]}
      >
        <Ionicons
          name="paper-plane-outline"
          size={20}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    paddingHorizontal: 12,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
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
