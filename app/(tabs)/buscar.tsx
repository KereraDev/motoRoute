import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRutasFeed } from '../../hooks/useRutasFeed';

const theme = {
  light: {
    containerBg: '#ffffff',
    searchBarBg: '#e0e0e0',
    cardBg: '#f9f9f9',
    borderColor: '#cccccc',
    textPrimary: '#000000',
    textSecondary: '#333333',
    placeholder: '#666666',
    icon: '#000000',
    likeIcon: 'red',
    mapUnavailableBg: '#eeeeee',
    polylineColor: '#007AFF',
  },
  dark: {
    containerBg: '#000000',
    searchBarBg: '#1e1e1e',
    cardBg: '#1e1e1e',
    borderColor: '#333333',
    textPrimary: '#ffffff',
    textSecondary: '#eeeeee',
    placeholder: '#aaaaaa',
    icon: '#ffffff',
    likeIcon: 'tomato',
    mapUnavailableBg: '#2a2a2a',
    polylineColor: '#0A84FF',
  },
};

const createStyles = (colors: typeof theme.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 16,
      backgroundColor: colors.containerBg,
    },
    searchBarWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.searchBarBg,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      marginLeft: 8,
      fontSize: 16,
      color: colors.textPrimary,
    },
    listContainer: {
      paddingBottom: 20,
    },
    card: {
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBg,
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
      color: colors.textPrimary,
    },
    mapPreview: {
      width: '100%',
      height: 200,
    },
    mapUnavailable: {
      height: 200,
      backgroundColor: colors.mapUnavailableBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    caption: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 14,
      color: colors.textSecondary,
    },
    likesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
  });

export default function BuscarScreen() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = theme[scheme];
  const styles = createStyles(colors);

  const { posts } = useRutasFeed();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredPosts = posts
    .filter(post =>
      `${post.username} ${post.caption}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));

  return (
    <View style={styles.container}>
      <View style={styles.searchBarWrapper}>
        <Ionicons name="search" size={20} color={colors.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rutas..."
          placeholderTextColor={colors.placeholder}
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
              <Pressable onPress={() => router.push(`/perfil/${item.creadorUid}`)}>
                <Image
                  source={{ uri: item.fotoPerfilURL || item.avatar }}
                  style={styles.avatar}
                />
              </Pressable>
              <Pressable onPress={() => router.push(`/perfil/${item.creadorUid}`)}>
                <Text style={styles.username}>@{item.username}</Text>
              </Pressable>
            </View>

            {Platform.OS !== 'web' ? (
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
                      strokeColor={colors.polylineColor}
                      strokeWidth={4}
                    />
                    <Marker coordinate={item.route[0]} title="Inicio" pinColor="green" />
                    <Marker
                      coordinate={item.route[item.route.length - 1]}
                      title="Fin"
                      pinColor="red"
                    />
                  </>
                )}
              </MapView>
            ) : (
              <View style={styles.mapUnavailable}>
                <Text style={{ color: colors.textPrimary }}>Mapa no disponible en web</Text>
              </View>
            )}

            <Text style={styles.caption}>📍 {item.caption}</Text>

            <View style={styles.likesRow}>
              <Ionicons name="heart" size={18} color={colors.likeIcon} />
              <Text style={{ color: colors.textPrimary, marginLeft: 4 }}>
                {item.likesCount}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
