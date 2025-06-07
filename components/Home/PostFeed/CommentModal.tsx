import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  useColorScheme,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '@/store/postStore';

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

  const post = usePostStore(state =>
    state.posts.find(post => post.id === postId)
  );
  const addComment = usePostStore(state => state.addComment);
  const toggleCommentLike = usePostStore(state => state.toggleCommentLike);
  const [newComment, setNewComment] = useState('');

  const handleSend = () => {
    if (newComment.trim()) {
      addComment(postId, newComment.trim());
      setNewComment('');
    }
  };

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
          data={post?.comments ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              <View style={styles.commentContent}>
                <Text
                  style={[
                    styles.username,
                    { color: isDark ? '#ccc' : '#696969' },
                  ]}
                >
                  {item.user.username}
                </Text>
                <View style={styles.commentRow}>
                  <Text
                    style={[
                      styles.commentText,
                      { color: isDark ? '#eee' : '#A9A9A9' },
                    ]}
                  >
                    {item.text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleCommentLike(postId, item.id)}
                    style={styles.commentLikeButton}
                  >
                    <Ionicons
                      name={item.liked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={item.liked ? 'tomato' : isDark ? '#aaa' : '#888'}
                    />
                    {(item.likes ?? 0) > 0 && (
                      <Text
                        style={[
                          styles.commentLikeCount,
                          { color: isDark ? '#aaa' : '#888' },
                        ]}
                      >
                        {item.likes}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          style={styles.commentsList}
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
    backgroundColor: '#A9A9A9',
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
  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  commentText: {
    fontSize: 15,
    flex: 1,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  commentLikeCount: {
    fontSize: 12,
    marginLeft: 3,
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
    borderRadius: 10,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#2196F3',
    borderRadius: 10,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
