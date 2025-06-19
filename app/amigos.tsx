import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const cargarAmigosAceptados = async (miUid: string, setAmigosAceptados: Function) => {
  if (!miUid) return;

  const amigos: any[] = [];

  const snapshot = await firestore()
    .collection('amigos')
    .where('estado', '==', 'aceptado')
    .where('usuarios', 'array-contains', miUid)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const amigoUid = data.usuarioA === miUid ? data.usuarioB : data.usuarioA;
    await agregarInfoDelAmigo(amigos, miUid, amigoUid);
  }
  amigos.sort((a, b) => b.time.localeCompare(a.time));
  setAmigosAceptados(amigos);
}  ;



const agregarInfoDelAmigo = async (lista: any[], miUid: string, amigoUid: string) => {
  const usuarioDoc = await firestore().collection('usuarios').doc(amigoUid).get();
  const userData = usuarioDoc.data();

  let lastMessage = '¡Empieza una conversación!';
  let time = '';
  let unread = false;

  const chatId = [miUid, amigoUid].sort().join('_');
  const chatDoc = await firestore().collection('chats').doc(chatId).get();
  const chatData = chatDoc.data();
  if (chatData) {
    if (chatData.ultimoMensaje) lastMessage = chatData.ultimoMensaje;
    if (chatData.timestampUltimo?.toDate) {
      const date = chatData.timestampUltimo.toDate();
      time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  if (userData) {
    lista.push({
      id: amigoUid,
      user: {
        name: userData.nombreVisible || 'Usuario',
        avatar: userData.fotoPerfilURL || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
      },
      lastMessage,
      time,
      unread,
    });
  }
};



export default function AmigosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = useState('');
  const router = useRouter();
  const [amigosAceptados, setAmigosAceptados] = useState<any[]>([]);

  // --- NUEVO: Solicitudes pendientes ---
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);
  const miUid = auth().currentUser?.uid;

  useFocusEffect(
    useCallback(() => {
      if (!miUid) return;
      const sub = firestore()
        .collection('amigos')
        .where('usuarioB', '==', miUid)
        .where('estado', '==', 'pendiente')
        .onSnapshot(snapshot => {
          setSolicitudesPendientes(snapshot.size);
          cargarAmigosAceptados(miUid, setAmigosAceptados);


        });

      return () => sub();
    }, [miUid])
  );
  // --- FIN NUEVO ---

  const filteredChats = amigosAceptados.filter(chat =>
  chat.user.name.toLowerCase().includes(search.toLowerCase())
);

 const handleChatPress = (chat: any) => {

    router.push({
      pathname: '/amigos/[id]',
      params: {
        id: chat.id,
        name: chat.user.name,
        avatar: chat.user.avatar,
      },
    });
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        <TextInput
          placeholder="Buscar amigo..."
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f2f2f2',
              color: isDark ? '#fff' : '#000',
              flex: 1,
              marginRight: 0,
            },
          ]}
        />
        <TouchableOpacity
          onPress={() => router.push('/amigos/buscarAmigos')}
          style={{
            marginLeft: 10,
            backgroundColor: '#1e90ff',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Feather name="user-plus" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/amigos/solicitudes')}
          style={{
            marginLeft: 10,
            backgroundColor: '#1e90ff',
            padding: 10,
            borderRadius: 8,
            position: 'relative',
          }}
        >
          <Ionicons name="mail" size={20} color="#fff" />
          {solicitudesPendientes > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'red',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 3,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                {solicitudesPendientes}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.chatList}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {filteredChats.map(chat => (
          <TouchableOpacity
            key={chat.id}
            style={[
              styles.chatItem,
              { borderBottomColor: isDark ? '#333' : '#eee' },
            ]}
            onPress={() => handleChatPress(chat)}
          >
            <Image
              source={{ uri: chat.user.avatar }}
              style={styles.chatAvatar}
            />
            <View style={styles.chatTextContainer}>
              <Text
                style={[styles.chatName, { color: isDark ? '#fff' : '#000' }]}
              >
                {chat.user.name}
              </Text>
              <Text
                style={[
                  styles.chatMessage,
                  { color: isDark ? '#aaa' : '#555' },
                ]}
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            </View>
            <View style={styles.chatMeta}>
              <Text
                style={[styles.chatTime, { color: isDark ? '#999' : '#999' }]}
              >
                {chat.time}
              </Text>
              {chat.unread && <View style={styles.unreadDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  searchInput: {
    margin: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  chatList: {
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatTextContainer: {
    flex: 1,
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  chatMessage: {
    fontSize: 13,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ADFF2F',
    marginTop: 4,
  },
});
