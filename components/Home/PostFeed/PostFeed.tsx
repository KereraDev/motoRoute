import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import ThemedText from '@/components/ui/ThemedText';
import CommentModal from './CommentModal';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useUserStore } from '../../../store/userStore';
import firestore from '@react-native-firebase/firestore';

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
  likes: number;
  liked?: boolean;
  comments?: any[];
};

type PostFeedProps = {
  posts: Post[];
};

type LikeButtonProps = {
  liked: boolean;
  likes: number;
  onToggle: () => void;
};

function LikeButton({ liked, likes, onToggle }: LikeButtonProps) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.iconWrapper,
        { transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={22}
        color={liked ? 'tomato' : textColor}
      />
      <ThemedText style={[styles.likeCount, { color: textColor }]}>
        {' '}
        {likes}{' '}
      </ThemedText>
    </Pressable>
  );
}

export default function PostFeed({ posts }: PostFeedProps) {
  const [commentsCount, setCommentsCount] = useState<{
    [postId: string]: number;
  }>({});
  const [likesState, setLikesState] = useState<{
    [postId: string]: { liked: boolean; count: number };
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<{
    [postId: string]: 'map' | 'image';
  }>({});
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const user = useUserStore(state => state.user);
  const userId = user?.uid;

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    posts.forEach(post => {
      const comentariosRef = firestore()
        .collection('rutas')
        .doc(post.id)
        .collection('comentarios');
      const unsubscribe = comentariosRef.onSnapshot(snapshot => {
        setCommentsCount(prev => ({ ...prev, [post.id]: snapshot.size }));
      });
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [posts]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribes: (() => void)[] = [];
    posts.forEach(post => {
      const postRef = firestore().collection('rutas').doc(post.id);
      const likeRef = postRef.collection('likes').doc(userId);
      const unsubscribe = likeRef.onSnapshot(snapshot => {
        postRef.get().then(postSnap => {
          setLikesState(prev => ({
            ...prev,
            [post.id]: {
              liked: !!snapshot.exists,
              count:
                typeof postSnap.data()?.likesCount === 'number'
                  ? postSnap.data()?.likesCount
                  : 0,
            },
          }));
        });
      });
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [posts, userId]);

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

  const handleToggleLike = async (postId: string) => {
    if (!userId) return;

    const likeRef = firestore()
      .collection('rutas')
      .doc(postId)
      .collection('likes')
      .doc(userId);
    const postRef = firestore().collection('rutas').doc(postId);

    const currentState = likesState[postId] || { liked: false, count: 0 };

    // Optimismo en UI
    setLikesState(prev => ({
      ...prev,
      [postId]: {
        liked: !currentState.liked,
        count: currentState.liked
          ? Math.max(0, currentState.count - 1)
          : currentState.count + 1,
      },
    }));

    await firestore().runTransaction(async transaction => {
      const likeDoc = await transaction.get(likeRef);
      const postDoc = await transaction.get(postRef);
      const currentCount = postDoc.exists()
        ? (postDoc.data()?.likesCount ?? 0)
        : 0;

      if (!likeDoc.exists) {
        transaction.set(likeRef, {
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        transaction.update(postRef, { likesCount: currentCount + 1 });
      } else if (currentCount > 0) {
        transaction.delete(likeRef);
        transaction.update(postRef, {
          likesCount: Math.max(0, currentCount - 1),
        });
      }
    });
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <View
      key={post.id}
      style={[
        styles.post,
        { backgroundColor: colorScheme === 'dark' ? '#181818' : '#fff' },
      ]}
    >
      <View style={styles.postHeader}>
        {post.avatar ? (
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={35}
            color="#ccc"
            style={styles.avatar}
          />
        )}
        <ThemedText style={[styles.postUsername, { color: textColor }]}>
          {post.username}
        </ThemedText>
      </View>

      {/* Mapa o imagen, con validación de ruta */}
      {post.route &&
      Array.isArray(post.route) &&
      post.route.length > 0 &&
      post.image ? (
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
        ) : (
          <Image source={{ uri: post.image }} style={styles.postImage} />
        )
      ) : post.route && Array.isArray(post.route) && post.route.length > 0 ? (
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
      ) : (
        <View style={styles.postImage}>
          <ThemedText style={{ textAlign: 'center', marginTop: 120 }}>
            Ruta no disponible
          </ThemedText>
        </View>
      )}

      <View style={styles.postActions}>
        <LikeButton
          liked={likesState[post.id]?.liked ?? false}
          likes={likesState[post.id]?.count ?? 0}
          onToggle={() => handleToggleLike(post.id)}
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
        <ThemedText style={[styles.postUsername, { color: textColor }]}>
          {post.username}{' '}
        </ThemedText>
        <ThemedText style={[styles.postTitle, { color: textColor }]}>
          {post.title}
        </ThemedText>
        <ThemedText style={{ color: textColor }}>{post.caption}</ThemedText>
      </View>
    </View>
  );

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
