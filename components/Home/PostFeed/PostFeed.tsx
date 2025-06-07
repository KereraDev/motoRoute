import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Post } from '../../../types/Post';
import ThemedText from '@/components/ui/ThemedText';
import CommentModal from './CommentModal';

type PostFeedProps = {
  posts: Post[];
  onToggleLike: (id: string) => void;
};

type LikeButtonProps = {
  liked: boolean;
  likes: number;
  onToggle: () => void;
};

function LikeButton({ liked, likes, onToggle }: LikeButtonProps) {
  const colorScheme = useColorScheme();

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
        color={liked ? 'tomato' : Colors[colorScheme ?? 'light'].text}
      />
      <ThemedText
        style={[
          styles.likeCount,
          { color: Colors[colorScheme ?? 'light'].text },
        ]}
      >
        {likes}
      </ThemedText>
    </Pressable>
  );
}

export default function PostFeed({ posts, onToggleLike }: PostFeedProps) {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<{
    [postId: string]: 'map' | 'image';
  }>({});

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

  return (
    <View style={styles.postsContainer}>
      {posts.map((post, index) => (
        <View key={post.id} style={styles.post}>
          <View
            style={[styles.postHeader, index === 0 && styles.firstPostHeader]}
          >
            <Image source={{ uri: post.avatar }} style={styles.avatar} />
            <ThemedText
              style={[
                styles.postUsername,
                { color: Colors[colorScheme ?? 'light'].text },
              ]}
            >
              {post.username}
            </ThemedText>
          </View>

          {post.route && post.image ? (
            viewMode[post.id] === 'image' ? (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            ) : (
              <MapView
                style={styles.postImage}
                initialRegion={{
                  latitude: post.route[0].latitude,
                  longitude: post.route[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
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
            )
          ) : post.route && post.route.length > 1 ? (
            <MapView
              style={styles.postImage}
              initialRegion={{
                latitude: post.route[0].latitude,
                longitude: post.route[0].longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
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
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}

          <View style={styles.postActions}>
            <LikeButton
              liked={post.liked ?? false}
              likes={post.likes}
              onToggle={() => onToggleLike(post.id)}
            />

            <Pressable
              onPress={() => openComments(post.id)}
              style={styles.iconWrapper}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color={Colors[colorScheme ?? 'light'].text}
              />
              <ThemedText
                style={[
                  styles.commentCount,
                  { color: Colors[colorScheme ?? 'light'].text },
                ]}
              >
                {post.comments?.length ?? 0}
              </ThemedText>
            </Pressable>

            {post.route && post.image && (
              <Pressable
                onPress={() => toggleView(post.id)}
                style={styles.iconWrapper}
              >
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.postCaption}>
            <ThemedText style={styles.postUsername}>
              {post.username}{' '}
            </ThemedText>
            <ThemedText>{post.caption}</ThemedText>
          </View>
        </View>
      ))}

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
  firstPostHeader: { paddingTop: 0 },
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
});
