import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Stack, router } from 'expo-router';

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
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

export default function SolicitudesScreen() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarios, setUsuarios] = useState<{ [uid: string]: Usuario }>({});
  const [loading, setLoading] = useState(true);
  const miUid = auth().currentUser?.uid;

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
                (usuario?.nombreVisible ?? 'Desconocido'),
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{usuario?.nombreVisible}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4caf50' }]}
          onPress={() => aceptarSolicitud(item.id)}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f44336' }]}
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

      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e90ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitudes de amistad</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={solicitudes}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: 'center',
                  color: '#999',
                  marginTop: 30,
                }}
              >
                No tienes solicitudes pendientes.
              </Text>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1e90ff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: '#ddd',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 6,
  },
});
