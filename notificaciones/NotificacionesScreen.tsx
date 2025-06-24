import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Notificacion } from './types';

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const router = useRouter();
  const uid = auth().currentUser?.uid;

  // Auxiliar para evitar repetir la ruta
  const getNotiRef = () =>
    firestore().collection('notificaciones').doc(uid).collection('lista');

  useEffect(() => {
    if (!uid) return;
    const sub = getNotiRef()
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const notis = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notificacion[];
        setNotificaciones(notis);
      });

    return () => sub();
  }, [uid]);

  const marcarComoLeido = async (id: string) => {
    if (!uid) return;
    await getNotiRef().doc(id).update({ leido: true });
  };

  const renderItem = ({ item }: { item: Notificacion }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: item.leido ? '#f0f0f0' : '#dff0ff' },
      ]}
      onPress={() => {
        marcarComoLeido(item.id);
        if (item.tipo === 'invitacion') {
          router.push('/amigos/solicitudes');
        }
      }}
    >
      <Ionicons
        name={
          item.tipo === 'comentario'
            ? 'chatbubble-ellipses'
            : item.tipo === 'meGusta'
              ? 'thumbs-up'
              : 'person-add'
        }
        size={20}
        color={item.leido ? '#888' : '#007AFF'}
        style={{ marginRight: 10 }}
      />
      <Text style={styles.text}>
        {item?.mensaje ?? 'Notificación'} {item.leido ? '✓' : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      <FlatList
        data={notificaciones}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.text}>Sin notificaciones.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
  },
});
