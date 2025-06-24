import { crearNotificacionComentario } from '@/notificaciones/crearNotificaciones';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
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
import Modal from 'react-native-modal';
import { useUserStore } from '../../../store/userStore';

type Comment = {
  id: string;
  text: string;
  user: {
    username: string;
    fotoPerfilURL?: string;
  };
  createdAt: any;
};

type CommentModalProps = {
  visible: boolean;
  onClose: () => void;
  postId: string;
};

export default function CommentModal({
  visible,
  onClose,
  postId,
}: CommentModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (!postId) return;
    const unsubscribe = firestore()
      .collection('rutas')
      .doc(postId)
      .collection('comentarios')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
        setComments(data);
        setLoading(false);
      });
    return unsubscribe;
  }, [postId]);

  const handleSend = async () => {
    if (!newComment.trim() || !user || !user.uid || !user.nombreVisible) {
      alert(
        'No se puede enviar el comentario. Usuario inválido o comentario vacío.'
      );
      return;
    }

    const rutaRef = firestore().collection('rutas').doc(postId);
    const comentariosRef = rutaRef.collection('comentarios');

    try {
      await firestore().runTransaction(async transaction => {
        const rutaDoc = await transaction.get(rutaRef);

        transaction.set(comentariosRef.doc(), {
          text: newComment.trim(),
          user: {
            username: user.nombreVisible,
            fotoPerfilURL: user.fotoPerfilURL ?? '',
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        const currentCount = rutaDoc.data()?.commentsCount ?? 0;
        transaction.update(rutaRef, {
          commentsCount: currentCount + 1,
        });
      });

      setNewComment('');

      // Obtener UID del creador de la ruta
      const rutaDoc = await rutaRef.get();
      const creadorUid = rutaDoc.data()?.creadorUid;

      if (creadorUid && creadorUid !== user.uid) {
        await crearNotificacionComentario({
          destinatarioUid: creadorUid,
          emisorNombre: user.nombreVisible,
          rutaId: postId,
        });
      }
    } catch (error) {
      console.error('❌ Error al enviar comentario:', error);
      alert('No se pudo enviar el comentario. Inténtalo nuevamente.');
    }
  };

  const renderEmptyComponent = () =>
    !loading ? (
      <Text
        style={{
          color: isDark ? '#aaa' : '#888',
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        ¡Sé el primero en comentar!
      </Text>
    ) : null;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      useNativeDriver={false}
      hideModalContentWhileAnimating
      style={styles.modal}
      propagateSwipe
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: isDark ? '#1c1c1e' : '#fff' },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.handleBar} />
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Comentarios
          </Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Image
                source={{
                  uri:
                    item.user.fotoPerfilURL?.length > 0
                      ? item.user.fotoPerfilURL
                      : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                }}
                style={styles.avatar}
              />
              <View style={styles.commentContent}>
                <Text
                  style={[styles.username, { color: isDark ? '#ccc' : '#000' }]}
                >
                  {item.user.username}
                </Text>
                <Text
                  style={[
                    styles.commentText,
                    { color: isDark ? '#eee' : '#000' },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          style={styles.commentsList}
          ListEmptyComponent={renderEmptyComponent}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#fff',
              borderColor: isDark ? '#333' : '#ccc',
            },
          ]}
        >
          <TextInput
            placeholder="Añade un comentario..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={newComment}
            onChangeText={setNewComment}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#2c2c2e' : '#fff',
                borderColor: isDark ? '#444' : '#ccc',
                color: isDark ? '#fff' : '#000',
              },
            ]}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#000',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    marginBottom: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  commentText: {
    fontSize: 15,
    flex: 1,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#1f618d',
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
