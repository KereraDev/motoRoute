import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Post } from '@/types/Post';

type CommentsSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  activePostId: string | null;
  posts: Post[];
  onAddComment: (postId: string, comment: string) => void;
};

export default function CommentsSheet({
  bottomSheetRef,
  activePostId,
  posts,
  onAddComment,
}: CommentsSheetProps) {
  const [comment, setComment] = useState('');

  const snapPoints = useMemo(() => ['50%', '80%'], []);
  const post = posts.find((p) => p.id === activePostId);

  const handleSend = () => {
    if (post && comment.trim()) {
      onAddComment(post.id, comment.trim());
      setComment('');
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.container}>
        {post ? (
          <>
            <Text style={styles.title}>Comentarios</Text>
            <FlatList
              data={post.comments ?? []}
              keyExtractor={(item, index) => `${post.id}-comment-${index}`}
              renderItem={({ item }) => (
                <Text style={styles.commentItem}>• {item}</Text>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            <View style={styles.inputContainer}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Escribe un comentario..."
                style={styles.input}
              />
              <Button title="Enviar" onPress={handleSend} />
            </View>
          </>
        ) : (
          <Text style={styles.loading}>Cargando...</Text>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  commentItem: {
    fontSize: 15,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
  },
});
