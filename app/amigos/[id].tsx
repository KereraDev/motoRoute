import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

// Tipado para los mensajes del chat
type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
};

// Utilidad para generar un chatId único y compartido
const generarChatId = (uid1: string, uid2: string) =>
  [uid1, uid2].sort().join('_');

export default function AmigoChatScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const { user } = useUserStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const miUid = auth().currentUser?.uid ?? '';
  const amigoUid = id as string;
  const chatId = generarChatId(miUid, amigoUid);

  // Oculta el header nativo
  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  // Suscripción en tiempo real a los mensajes del chat
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('mensajes')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const mensajesFirebase: ChatMessage[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            if (!data.timestamp) return null;
            return {
              id: doc.id,
              sender: data.de === miUid ? 'me' : 'them',
              text: data.texto,
            };
          })
          .filter(Boolean) as ChatMessage[];
        setMessages(mensajesFirebase);
      });

    return () => unsubscribe();
  }, [chatId, miUid]);

  // Envía un mensaje y actualiza el resumen del chat
  const sendMessage = useCallback(async () => {
    if (inputText.trim() === '') return;

    const mensaje = {
      texto: inputText.trim(),
      de: miUid,
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    await firestore()
      .collection('chats')
      .doc(chatId)
      .collection('mensajes')
      .add(mensaje);

    await firestore()
      .collection('chats')
      .doc(chatId)
      .set(
        {
          participantes: [miUid, amigoUid],
          ultimoMensaje: mensaje.texto,
          timestampUltimo: mensaje.timestamp,
        },
        { merge: true }
      );

    setInputText('');
  }, [inputText, miUid, amigoUid, chatId]);

  // Renderiza cada mensaje
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageRight : styles.messageLeft,
          {
            backgroundColor: isMe ? '#008000' : isDark ? '#333' : '#e0e0e0',
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
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#fff' },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#111' : '#f9f9f9',
            borderBottomColor: isDark ? '#222' : '#ccc',
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

      {/* Mensajes */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatArea}
      />

      {/* Input */}
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
          onSubmitEditing={sendMessage}
          returnKeyType="send"
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
    backgroundColor: '#008000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
