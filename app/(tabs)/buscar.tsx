import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  useColorScheme,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '@/store/postStore';

export default function BuscarScreen() {
  const colorScheme = useColorScheme();
  const posts = usePostStore(state => state.posts);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = [...posts]
    .filter(post =>
      `${post.username} ${post.caption}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.searchBarWrapper}>
        <Ionicons
          name="search"
          size={20}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: colorScheme === 'dark' ? '#fff' : '#000' },
          ]}
          placeholder="Buscar rutas..."
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.userRow}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <Text
                style={[
                  styles.username,
                  { color: colorScheme === 'dark' ? '#fff' : '#000' },
                ]}
              >
                @{item.username}
              </Text>
            </View>

            <MapView
              style={styles.mapPreview}
              initialRegion={{
                latitude: item.route?.[0]?.latitude ?? -33.4489,
                longitude: item.route?.[0]?.longitude ?? -70.6693,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {item.route && item.route.length > 1 && (
                <>
                  <Polyline
                    coordinates={item.route}
                    strokeColor="#007AFF"
                    strokeWidth={4}
                  />
                  <Marker
                    coordinate={item.route[0]}
                    title="Inicio"
                    pinColor="green"
                  />
                  <Marker
                    coordinate={item.route[item.route.length - 1]}
                    title="Fin"
                    pinColor="red"
                  />
                </>
              )}
            </MapView>

            <Text
              style={[
                styles.caption,
                { color: colorScheme === 'dark' ? '#eee' : '#333' },
              ]}
            >
              📍 {item.caption}
            </Text>

            <View style={styles.likesRow}>
              <Ionicons
                name="heart"
                size={18}
                color={colorScheme === 'dark' ? 'tomato' : 'red'}
              />
              <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
                {' '}
                {item.likes}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 16 },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  mapPreview: {
    width: '100%',
    height: 200,
  },
  caption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});
