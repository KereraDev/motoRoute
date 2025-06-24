import ThemedText from '@/components/ui/ThemedText';
import { crearNotificacionLike } from '@/notificaciones/crearNotificaciones'; // Ajusta la ruta si es diferente
import { Ionicons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useUserStore } from '../../../store/userStore';
import CommentModal from './CommentModal';
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

type Post = {
  id: string;
  username: string;
  avatar?: string;
  caption: string;
  title?: string;
  route?: { latitude: number; longitude: number }[];
  image?: string;
  likesCount: number;
  likedBy: string[];
  fotoPerfilURL?: string;
  creadorUid?: string;
};

type PostFeedProps = {
  posts: Post[];
};

type LikeButtonProps = {
  onToggle: () => void;
  count: number;
  liked: boolean;
  disabled?: boolean;
};

function LikeButton({ onToggle, count, liked, disabled }: LikeButtonProps) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.iconWrapper,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={22}
        color={liked ? 'red' : textColor}
      />
      <ThemedText style={[styles.likeCount, { color: textColor }]}>
        {' '}
        {count}
      </ThemedText>
    </Pressable>
  );
}

export default function PostFeed({ posts }: PostFeedProps) {
  const router = useRouter();
  const [commentsCount, setCommentsCount] = useState<{
    [postId: string]: number;
  }>({});
  const [likesState, setLikesState] = useState<{
    [postId: string]: { count: number; liked: boolean };
  }>(() => {
    // Inicializa con los datos de los posts
    const initial: { [postId: string]: { count: number; liked: boolean } } = {};
    posts.forEach(post => {
      initial[post.id] = {
        count: post.likesCount,
        liked: false, // Se setea después según usuario
      };
    });
    return initial;
  });
  const [likeDisabled, setLikeDisabled] = useState<{
    [postId: string]: boolean;
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<{
    [postId: string]: 'map' | 'image';
  }>({});
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const user = useUserStore(state => state.user);

  // Inicializa los liked del usuario solo al montar o cuando cambian los posts o el user
  useEffect(() => {
    if (!user) return;
    setLikesState(prev => {
      const updated = { ...prev };
      posts.forEach(post => {
        updated[post.id] = {
          count: post.likesCount,
          liked: Array.isArray(post.likedBy)
            ? post.likedBy.includes(user.uid)
            : false,
        };
      });
      return updated;
    });
  }, [posts, user]);

  // Los comentarios sí pueden ser a tiempo real (opcional)
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    posts.forEach(post => {
      const rutaRef = firestore().collection('rutas').doc(post.id);
      const unsubscribe = rutaRef.onSnapshot(doc => {
        setCommentsCount(prev => ({
          ...prev,
          [post.id]: doc.data()?.commentsCount ?? 0,
        }));
      });
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [posts]);

  // Optimistic UI + button locking (tipo Instagram)
  const handleLikeToggle = async (postId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para dar like.');
      return;
    }
    if (likeDisabled[postId]) return; // Prevent rapid spamming

    setLikeDisabled(prev => ({ ...prev, [postId]: true }));

    setLikesState(prev => {
      const current = prev[postId] || { count: 0, liked: false };
      return {
        ...prev,
        [postId]: {
          count: current.liked
            ? Math.max(0, current.count - 1)
            : current.count + 1,
          liked: !current.liked,
        },
      };
    });

    const rutaRef = firestore().collection('rutas').doc(postId);

    try {
      await firestore().runTransaction(async transaction => {
        const doc = await transaction.get(rutaRef);
        const data = doc.data();
        const currentCount = data?.likesCount ?? 0;
        const likedBy: string[] = Array.isArray(data?.likedBy)
          ? data.likedBy
          : [];

        if (likedBy.includes(user.uid)) {
          // Quitar like
          transaction.update(rutaRef, {
            likesCount: currentCount > 0 ? currentCount - 1 : 0,
            likedBy: likedBy.filter(uid => uid !== user.uid),
          });
        } else {
          // Dar like
          transaction.update(rutaRef, {
            likesCount: currentCount + 1,
            likedBy: [...likedBy, user.uid],
          });

          // Crear notificación (fuera del transaction)
          if (data?.creadorUid && data?.creadorUid !== user.uid) {
            setTimeout(() => {
              crearNotificacionLike({
                destinatarioUid: data.creadorUid,
                emisorNombre: user.nombreVisible,
                rutaId: postId,
              });
            }, 0);
          }
        }
      });
    } catch (err) {
      setLikesState(prev => {
        const current = prev[postId] || { count: 0, liked: false };
        return {
          ...prev,
          [postId]: {
            count: current.liked
              ? Math.max(0, current.count - 1)
              : current.count + 1,
            liked: !current.liked,
          },
        };
      });
      alert('Error al actualizar like.');
    } finally {
      setLikeDisabled(prev => ({ ...prev, [postId]: false }));
    }
  };

  const openComments = (postId: string) => {
    setSelectedPostId(postId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPostId(null);
  };

  const toggleView = (postId: string) => {
    setViewMode(prev => ({
      ...prev,
      [postId]: prev[postId] === 'map' ? 'image' : 'map',
    }));
  };

  const renderPost = ({ item: post }: { item: Post }) => {
    const likeInfo = likesState[post.id] || {
      count: post.likesCount,
      liked: user ? post.likedBy.includes(user.uid) : false,
    };

    return (
      <View
        key={post.id}
        style={[
          styles.post,
          { backgroundColor: colorScheme === 'dark' ? '#181818' : '#fff' },
        ]}
      >
        <View style={styles.postHeader}>
          {post.fotoPerfilURL ? (
            <Pressable
              onPress={() => router.push(`/perfil/${post.creadorUid}`)}
            >
              <Image
                source={{ uri: post.fotoPerfilURL }}
                style={styles.avatar}
              />
            </Pressable>
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={35}
              color="#ccc"
              style={styles.avatar}
            />
          )}
          <Pressable onPress={() => router.push(`/perfil/${post.creadorUid}`)}>
            <ThemedText style={[styles.postUsername, { color: textColor }]}>
              {post.username}
            </ThemedText>
          </Pressable>
        </View>

        {/* Imagen/marcador/mapa */}
        {post.route && Array.isArray(post.route) && post.route.length > 0 ? (
          viewMode[post.id] === 'map' ? (
            Platform.OS !== 'web' && MapView ? (
              <MapView
                style={styles.postImage}
                initialRegion={{
                  latitude: post.route[0].latitude,
                  longitude: post.route[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Polyline
                  coordinates={post.route}
                  strokeColor="#007AFF"
                  strokeWidth={4}
                />
                <Marker
                  coordinate={post.route[0]}
                  title="Inicio"
                  pinColor="green"
                />
                <Marker
                  coordinate={post.route[post.route.length - 1]}
                  title="Fin"
                  pinColor="red"
                />
              </MapView>
            ) : (
              <View style={styles.postImage} />
            )
          ) : post.image ? (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          ) : null
        ) : post.image ? (
          <Image source={{ uri: post.image }} style={styles.postImage} />
        ) : (
          <View style={styles.postImage}>
            <ThemedText style={{ textAlign: 'center', marginTop: 120 }}>
              Ruta no disponible
            </ThemedText>
          </View>
        )}

        <View style={styles.postActions}>
          <LikeButton
            onToggle={() => handleLikeToggle(post.id)}
            count={likeInfo.count}
            liked={likeInfo.liked}
            disabled={likeDisabled[post.id] || false}
          />

          <Pressable
            onPress={() => openComments(post.id)}
            style={styles.iconWrapper}
          >
            <Ionicons name="chatbubbles-outline" size={22} color={textColor} />
            <ThemedText style={[styles.commentCount, { color: textColor }]}>
              {commentsCount[post.id] ?? 0}
            </ThemedText>
          </Pressable>

          {post.route && post.image && (
            <Pressable
              onPress={() => toggleView(post.id)}
              style={styles.iconWrapper}
            >
              <Ionicons name="location-outline" size={22} color={textColor} />
            </Pressable>
          )}
        </View>

        <View style={styles.postCaption}>
          <Pressable onPress={() => router.push(`/perfil/${post.creadorUid}`)}>
            <ThemedText style={[styles.postUsername, { color: textColor }]}>
              {post.username}
            </ThemedText>
          </Pressable>
          <ThemedText style={[styles.postTitle, { color: textColor }]}>
            {post.title}
          </ThemedText>
          <ThemedText style={{ color: textColor }}>{post.caption}</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.postsContainer}>
      <FlatList
        data={posts}
        keyExtractor={post => post.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      {selectedPostId && (
        <CommentModal
          visible={modalVisible}
          onClose={closeModal}
          postId={selectedPostId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: { flex: 1 },
  post: { marginBottom: 15 },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postImage: { width: '100%', height: 300 },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
  },
  postCaption: {
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexDirection: 'column',
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 16,
  },
  commentCount: {
    marginLeft: 4,
    fontSize: 16,
  },
  postTitle: {
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginBottom: 4,
  },
});
