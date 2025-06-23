import ThemedText from '@/components/ui/ThemedText';
import { useTabIndexStore } from '@/store/tabIndexStore';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '../../../hooks/useColorScheme';

// Importa ambas versiones del logo
const logoLight = require('../../../assets/images/logo-dark.png'); // para fondo oscuro
const logoDark = require('../../../assets/images/logo-light.png');

export default function Header() {
  const colorScheme = useColorScheme();
  const { user } = useUserStore();
  const setIndex = useTabIndexStore(state => state.setIndex);

  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;

    // Notificaciones generales (comentarios, likes, etc.)
    const subNotificaciones = firestore()
      .collection('notificaciones')
      .doc(uid)
      .collection('lista') // o el subnombre que uses
      .where('leido', '==', false)
      .onSnapshot(snapshot => {
        setNotificacionesNoLeidas(snapshot.size);
      });

    // Solicitudes de amistad pendientes
    const subSolicitudes = firestore()
      .collection('amigos')
      .where('usuarioB', '==', uid)
      .where('estado', '==', 'pendiente')
      .onSnapshot(snapshot => {
        setSolicitudesPendientes(snapshot.size);
      });

    return () => {
      subNotificaciones();
      subSolicitudes();
    };
  }, [user?.uid]);

  const totalNotificaciones = notificacionesNoLeidas + solicitudesPendientes;

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
        Bienvenido {user?.nombreVisible ?? ''}
      </ThemedText>
      <Pressable
        onPress={() => setIndex(4)}
        style={({ hovered, pressed }) => [
          styles.iconButton,
          (hovered || pressed) && styles.iconButtonHover,
        ]}
      >
        <View style={{ position: 'relative' }}>
          <Ionicons
            name={
              totalNotificaciones > 0 ? 'mail-unread-sharp' : 'mail-open-sharp'
            }
            size={25}
            color={colorScheme === 'dark' ? '#fff' : '#000'}
          />
          {totalNotificaciones > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: 'red',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
              >
                {totalNotificaciones}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      <Pressable
        onPress={() => setIndex(1)}
        style={({ hovered, pressed }) => [
          styles.iconButton,
          (hovered || pressed) && styles.iconButtonHover,
        ]}
      >
        <Ionicons
          name="people-sharp"
          size={25}
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
    padding: 4,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonHover: {
    backgroundColor: '#e6e6e6',
  },
});
