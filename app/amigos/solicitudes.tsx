import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

type Solicitud = {
  id: string;
  usuarioA: string;
};

type Usuario = {
  nombreVisible: string;
  fotoPerfilURL?: string;
};

const theme = {
  light: {
    containerBg: '#ffffff',
    headerBg: '#f9f9f9',
    headerTitle: '#1e90ff',
    backIcon: '#1e90ff',
    cardBg: '#f2f2f2',
    borderColor: '#dddddd',
    nameText: '#000000',
    buttonAcceptBg: '#4caf50',
    buttonRejectBg: '#f44336',
    avatarBg: '#dddddd',
    emptyText: '#999999',
    activityIndicator: '#1e90ff',
  },
  dark: {
    containerBg: '#000000',
    headerBg: '#111111',
    headerTitle: '#1e90ff',
    backIcon: '#ffffff',
    cardBg: '#1e1e1e',
    borderColor: '#333333',
    nameText: '#ffffff',
    buttonAcceptBg: '#4caf50',
    buttonRejectBg: '#f44336',
    avatarBg: '#555555',
    emptyText: '#777777',
    activityIndicator: '#1e90ff',
  },
};

type ThemeColors = typeof theme.light;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.containerBg,
    },
    header: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
      backgroundColor: colors.headerBg,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
      color: colors.headerTitle,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBg,
      borderRadius: 10,
      padding: 10,
      marginBottom: 12,
      borderColor: colors.borderColor,
      borderWidth: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 10,
      backgroundColor: colors.avatarBg,
    },
    name: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.nameText,
    },
    button: {
      padding: 8,
      borderRadius: 8,
      marginLeft: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContainer: {
      padding: 16,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.emptyText,
      marginTop: 30,
    },
  });

export default function SolicitudesScreen() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = theme[scheme];
  const styles = createStyles(colors);

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarios, setUsuarios] = useState<{ [uid: string]: Usuario }>({});
  const [loading, setLoading] = useState(true);
  const miUid = auth().currentUser?.uid ?? '';

  useEffect(() => {
    if (!miUid) return;

    const sub = firestore()
      .collection('amigos')
      .where('usuarioB', '==', miUid)
      .where('estado', '==', 'pendiente')
      .onSnapshot(async snapshot => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Solicitud[];

        setSolicitudes(docs);

        const uids = docs.map(s => s.usuarioA);
        const batch = await Promise.all(
          uids.map(uid => firestore().collection('usuarios').doc(uid).get())
        );

        const nuevos = Object.fromEntries(
          batch.map(doc => [
            doc.id,
            {
              nombreVisible: doc.data()?.nombreVisible ?? 'Desconocido',
              fotoPerfilURL: doc.data()?.fotoPerfilURL ?? '',
            },
          ])
        );
        setUsuarios(nuevos);
        setLoading(false);
      });

    return () => sub();
  }, [miUid]);

  const aceptarSolicitud = async (id: string) => {
    await firestore().collection('amigos').doc(id).update({
      estado: 'aceptado',
    });
  };

  const rechazarSolicitud = async (id: string) => {
    await firestore().collection('amigos').doc(id).delete();
  };

  const renderItem = ({ item }: { item: Solicitud }) => {
    const usuario = usuarios[item.usuarioA];

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: usuario?.fotoPerfilURL?.startsWith('http')
              ? usuario.fotoPerfilURL
              : 'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(usuario?.nombreVisible ?? 'Desconocido'),
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{usuario?.nombreVisible}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonAcceptBg }]}
          onPress={() => aceptarSolicitud(item.id)}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonRejectBg }]}
          onPress={() => rechazarSolicitud(item.id)}
        >
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitudes de amistad</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 30 }}
            color={colors.activityIndicator}
          />
        ) : (
          <FlatList
            data={solicitudes}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No tienes solicitudes pendientes.
              </Text>
            }
          />
        )}
      </View>
    </>
  );
}
