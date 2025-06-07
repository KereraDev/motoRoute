import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';

export default function AmigoChatScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const { user } = useUserStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  type ChatMessage = {
    id: string;
    sender: 'me' | 'them';
    text: string;
  };

  const dummyChatsById: Record<string, ChatMessage[]> = {
    '1': [
      {
        id: '1',
        sender: 'them',
        text: 'Oe wn, ¿mañana subimos el cerro o qué?',
      },
      { id: '2', sender: 'me', text: '¡Obvio que sí, bro! 🚴‍♂️' },
    ],
    '2': [
      { id: '1', sender: 'them', text: 'Jajaja esa ruta quedó joya, bro 🔥' },
      { id: '2', sender: 'me', text: 'Nos lucimos en esa toma 😎' },
    ],
    '3': [
      { id: '1', sender: 'them', text: 'Te pasaste con la fotoooo 😍' },
      {
        id: '2',
        sender: 'me',
        text: 'Gracias! Me inspiré en el atardecer jeje',
      },
    ],
    '4': [
      { id: '1', sender: 'them', text: 'Ya po, ¿nos vamos o no? 😂' },
      { id: '2', sender: 'me', text: '¡En una hora paso por ti!' },
    ],
    '5': [
      { id: '1', sender: 'them', text: 'Manda ubicación po compa' },
      { id: '2', sender: 'me', text: 'Recién la compartí por WhatsApp' },
    ],
    '6': [
      { id: '1', sender: 'them', text: 'No me quedé dormido, lo juro jaja' },
      { id: '2', sender: 'me', text: 'Te estábamos esperando jajaja' },
    ],
    '7': [
      { id: '1', sender: 'them', text: 'Traes la GoPro?' },
      { id: '2', sender: 'me', text: 'Obvio, batería al 100%' },
    ],
    '8': [
      {
        id: '1',
        sender: 'them',
        text: 'Me perdí pero encontré un mirador brutal',
      },
      { id: '2', sender: 'me', text: '¡Sube foto, hermanooo! 🔥' },
    ],
  };

  const [messages, setMessages] = useState(dummyChatsById[id as string] || []);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageRight : styles.messageLeft,
          {
            backgroundColor: isMe ? '#007bff' : isDark ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isMe ? '#fff' : isDark ? '#fff' : '#000' },
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#111' : '#f9f9f9',
            borderBottomColor: isDark ? '#222' : '#ccc',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <Image source={{ uri: avatar as string }} style={styles.avatar} />
        <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
          {name}
        </Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatArea}
      />

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: isDark ? '#111' : '#f9f9f9' },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#000' : '#fff',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? '#444' : '#ddd',
            },
          ]}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={isDark ? '#777' : '#aaa'}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: 'white' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  backButton: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatArea: {
    padding: 16,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: '70%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 0.5,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
