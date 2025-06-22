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

const theme = {
  light: {
    containerBg: '#ffffff',
    searchBarBg: '#f2f2f2',
    inputBg: '#ffffff',
    inputBorder: '#cccccc',
    cardBg: '#f9f9f9',
    borderColor: '#cccccc',
    textPrimary: '#000000',
    textSecondary: '#555555',
    placeholder: '#aaaaaa',
    iconColor: '#000000',
    botonAccionBg: '#1f618d',
    notificationBg: '#e74c3c',
    unreadDot: '#ADFF2F',
  },
  dark: {
    containerBg: '#000000',
    searchBarBg: '#1a1a1a',
    inputBg: '#1a1a1a',
    inputBorder: '#333333',
    cardBg: '#1e1e1e',
    borderColor: '#333333',
    textPrimary: '#ffffff',
    textSecondary: '#aaaaaa',
    placeholder: '#888888',
    iconColor: '#ffffff',
    botonAccionBg: '#1f618d',
    notificationBg: '#e74c3c',
    unreadDot: '#ADFF2F',
  },
};

const createStyles = (colors: typeof theme.light) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.containerBg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 18,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      color: colors.textPrimary,
    },
    botonAccion: {
      marginLeft: 10,
      backgroundColor: colors.botonAccionBg,
      padding: 10,
      borderRadius: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificacion: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: colors.notificationBg,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 3,
    },
    notificacionTexto: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    chatList: {
      paddingHorizontal: 16,
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderColor,
      borderRadius: 18,
      marginBottom: 12,
      backgroundColor: colors.cardBg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    chatAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    chatTextContainer: {
      flex: 1,
    },
    chatName: {
      fontWeight: 'bold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    chatMessage: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    chatMeta: {
      alignItems: 'flex-end',
    },
    chatTime: {
      fontSize: 11,
      marginRight: 8,
      color: colors.textSecondary,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.unreadDot,
      marginTop: 4,
    },
  });

export default function AmigosScreen() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = theme[scheme];
  const styles = createStyles(colors);

  const [search, setSearch] = useState('');
  const router = useRouter();
  const [amigosAceptados, setAmigosAceptados] = useState<any[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);
  const miUid = auth().currentUser?.uid ?? '';

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

  const filteredChats = amigosAceptados.filter(chat =>
    chat.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChatPress = (chat: any) => {
    router.push({
      pathname: '/amigos/[id]',
      params: { id: chat.id, name: chat.user.name, avatar: chat.user.avatar },
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TextInput
          placeholder="Buscar amigo..."
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={() => router.push('/amigos/buscarAmigos')}
          style={styles.botonAccion}
        >
          <Feather name="user-plus" size={20} color={colors.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/amigos/solicitudes')}
          style={styles.botonAccion}
        >
          <Ionicons name="mail" size={20} color={colors.iconColor} />
          {solicitudesPendientes > 0 && (
            <View style={styles.notificacion}>
              <Text style={styles.notificacionTexto}>
                {solicitudesPendientes}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatList} keyboardShouldPersistTaps="handled">
        {filteredChats.map(chat => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => handleChatPress(chat)}
          >
            <Image source={{ uri: chat.user.avatar }} style={styles.chatAvatar} />
            <View style={styles.chatTextContainer}>
              <Text style={styles.chatName}>{chat.user.name}</Text>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
            <View style={styles.chatMeta}>
              <Text style={styles.chatTime}>{chat.time}</Text>
              {chat.unread && <View style={styles.unreadDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

async function cargarAmigosAceptados(miUid: string, setAmigosAceptados: Function) {
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
}

async function agregarInfoDelAmigo(lista: any[], miUid: string, amigoUid: string) {
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
}
