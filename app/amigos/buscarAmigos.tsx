// app/amigos/buscarAmigos.tsx

import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

type Usuario = {
  uid: string;
  nombreVisible: string;
  fotoPerfilURL: string;
  nombreVisibleLower?: string;
};

type Amistad = {
  id: string;
  estado: string;
  usuarios: string[];
  usuarioA: string;
  usuarioB: string;
};

export default function BuscarAmigosScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PantallaContenido />
    </>
  );
}

function PantallaContenido() {
  const { user } = useUserStore();
  const [searchText, setSearchText] = useState('');
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [amistades, setAmistades] = useState<Amistad[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);
  const isDark = useColorScheme() === 'dark';

  const miUid = auth().currentUser?.uid;

  useEffect(() => {
    if (!miUid) return;
    const sub = firestore()
      .collection('amigos')
      .where('usuarios', 'array-contains', miUid)
      .onSnapshot(snapshot => {
        setAmistades(
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Amistad)
        );
      });
    return () => sub();
  }, [miUid]);

  useEffect(() => {
    if (searchText.trim().length < 3) {
      setResultados([]);
      return;
    }
    setLoading(true);
    const queryLower = searchText.trim().toLowerCase();
    const sub = firestore()
      .collection('usuarios')
      .where('nombreVisibleLower', '>=', queryLower)
      .where('nombreVisibleLower', '<=', queryLower + '\uf8ff')
      .limit(10)
      .onSnapshot(snapshot => {
        const data = snapshot.docs
          .map(doc => ({ uid: doc.id, ...doc.data() }) as Usuario)
          .filter(u => u.uid !== miUid);
        setResultados(data);
        setLoading(false);
      });
    return () => sub();
  }, [searchText, miUid]);

  const getEstadoAmistad = useCallback(
    (amigoUid: string) => {
      const amistad = amistades.find(a => a.usuarios.includes(amigoUid));
      if (!amistad) return null;
      return amistad.estado;
    },
    [amistades]
  );

  const enviarInvitacion = async (amigoUid: string) => {
    setEnviando(amigoUid);
    try {
      const existente = await firestore()
        .collection('amigos')
        .where('usuarios', 'in', [
          [miUid, amigoUid],
          [amigoUid, miUid],
        ])
        .get();

      if (!existente.empty) {
        alert('Ya hay una solicitud en curso.');
        setEnviando(null);
        return;
      }

      await firestore()
        .collection('amigos')
        .add({
          creadoEn: firestore.FieldValue.serverTimestamp(),
          estado: 'pendiente',
          invitador: miUid,
          usuarioA: miUid,
          usuarioB: amigoUid,
          usuarios: [miUid, amigoUid],
        });
      alert('Invitación enviada');
    } catch (e) {
      alert('Error al enviar invitación');
    }
    setEnviando(null);
  };

  const renderItem = ({ item }: { item: Usuario }) => {
    const estado = getEstadoAmistad(item.uid);

    return (
      <View
        style={[styles.card, { backgroundColor: isDark ? '#111' : '#f2f2f2' }]}
      >
        <Image
          source={{
            uri:
              item.fotoPerfilURL?.startsWith('http') && item.fotoPerfilURL
                ? item.fotoPerfilURL
                : 'https://ui-avatars.com/api/?name=' + item.nombreVisible,
          }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
          {item.nombreVisible}
        </Text>

        {estado === 'aceptado' ? (
          <View style={styles.estadoBox}>
            <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
            <Text style={styles.estadoText}>Amigos</Text>
          </View>
        ) : estado === 'pendiente' ? (
          <View style={styles.estadoBox}>
            <Ionicons name="time" size={18} color="#fbc02d" />
            <Text style={styles.estadoText}>Pendiente</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => enviarInvitacion(item.uid)}
            style={styles.inviteButton}
            disabled={enviando === item.uid}
            accessibilityLabel="Agregar amigo"
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6 }}>
              {enviando === item.uid ? 'Enviando...' : 'Agregar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      {/* Cabecera con botón atrás y título */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1e90ff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e90ff' }}>
          Buscar amigos
        </Text>
      </View>

      {/* Input de búsqueda */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TextInput
          placeholder="Buscar amigo..."
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={searchText}
          onChangeText={setSearchText}
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? '#222' : '#f9f9f9',
              color: isDark ? '#fff' : '#333',
              borderColor: isDark ? '#555' : '#ccc',
            },
          ]}
          autoCapitalize="none"
        />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      <FlatList
        data={resultados}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          searchText.length >= 3 && !loading ? (
            <Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>
              No se encontraron usuarios.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  inviteButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 4,
  },
  estadoText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    borderRadius: 18,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
