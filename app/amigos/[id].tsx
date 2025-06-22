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

const theme = {
  light: {
    containerBg: '#ffffff',
    headerBg: '#f9f9f9',
    headerBorder: '#cccccc',
    backIcon: '#000000',
    nameText: '#000000',
    messageBgMe: '#1f618d',
    messageBgThem: '#e0e0e0',
    messageTextMe: '#ffffff',
    messageTextThem: '#000000',
    chatAreaBg: '#ffffff',
    inputContainerBg: '#f9f9f9',
    inputBg: '#ffffff',
    inputBorder: '#dddddd',
    placeholder: '#aaaaaa',
    sendButtonBg: '#1f618d',
    sendButtonText: '#ffffff',
  },
  dark: {
    containerBg: '#000000',
    headerBg: '#111111',
    headerBorder: '#222222',
    backIcon: '#ffffff',
    nameText: '#ffffff',
    messageBgMe: '#1f618d',
    messageBgThem: '#333333',
    messageTextMe: '#ffffff',
    messageTextThem: '#ffffff',
    chatAreaBg: '#000000',
    inputContainerBg: '#111111',
    inputBg: '#000000',
    inputBorder: '#444444',
    placeholder: '#777777',
    sendButtonBg: '#1f618d',
    sendButtonText: '#ffffff',
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
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.headerBg,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.headerBorder,
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
      color: colors.nameText,
    },
    chatArea: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: colors.chatAreaBg,
    },
    messageContainer: {
      padding: 10,
      borderRadius: 10,
      marginVertical: 4,
      maxWidth: '70%',
    },
    messageLeft: {
      alignSelf: 'flex-start',
      backgroundColor: colors.messageBgThem,
    },
    messageRight: {
      alignSelf: 'flex-end',
      backgroundColor: colors.messageBgMe,
    },
    messageText: {
      fontSize: 15,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 8,
      backgroundColor: colors.inputContainerBg,
      borderTopWidth: 0.5,
      borderTopColor: colors.headerBorder,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      color: colors.nameText,
      marginRight: 8,
    },
    sendButton: {
      backgroundColor: colors.sendButtonBg,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    sendButtonText: {
      color: colors.sendButtonText,
      fontWeight: 'bold',
    },
  });

export default function AmigoChatScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const { user } = useUserStore();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = theme[scheme];
  const styles = createStyles(colors);
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
        const msgs = snapshot.docs
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
        setMessages(msgs);
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
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isMe ? colors.messageTextMe : colors.messageTextThem },
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
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.backIcon} />
        </TouchableOpacity>
        <Image source={{ uri: avatar as string }} style={styles.avatar} />
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* Mensajes */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatArea}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.placeholder}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
