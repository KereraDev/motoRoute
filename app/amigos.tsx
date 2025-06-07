import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTabIndexStore } from '@/store/tabIndexStore';

const dummyChats = [
  {
    id: '1',
    user: {
      name: 'rider_maipo',
      avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
    },
    lastMessage: 'Oe wn, ¿mañana subimos el cerro o qué?',
    time: '10:45',
    unread: true,
  },
  {
    id: '2',
    user: {
      name: 'valentina_trips',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    lastMessage: 'Jajaja esa ruta quedó joya, bro 🔥',
    time: '09:18',
    unread: false,
  },
  {
    id: '3',
    user: {
      name: 'Lucas | @explorer_chile',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    lastMessage: 'Te pasaste con la fotoooo 😍',
    time: '08:30',
    unread: true,
  },
  {
    id: '4',
    user: {
      name: 'renata.motera',
      avatar: 'https://randomuser.me/api/portraits/women/80.jpg',
    },
    lastMessage: 'Ya po, ¿nos vamos o no? 😂',
    time: '07:41',
    unread: true,
  },
  {
    id: '5',
    user: {
      name: 'el_fabi.rides',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    },
    lastMessage: 'Manda ubicación po compa',
    time: 'Ayer',
    unread: false,
  },
  {
    id: '6',
    user: {
      name: 'javi_trip',
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    lastMessage: 'No me quedé dormido, lo juro jaja',
    time: 'Dom',
    unread: true,
  },
  {
    id: '7',
    user: {
      name: 'camila_ride',
      avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
    },
    lastMessage: 'Traes la GoPro?',
    time: 'Dom',
    unread: false,
  },
  {
    id: '8',
    user: {
      name: 'ale.nómada',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    lastMessage: 'Me perdí pero encontré un mirador brutal',
    time: 'Sab',
    unread: false,
  },
];

export default function AmigosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = useState('');
  const router = useRouter(); // ✅ Importante

  const filteredChats = dummyChats.filter(chat =>
    chat.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChatPress = (chat: (typeof dummyChats)[0]) => {
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
          },
        ]}
      />

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
