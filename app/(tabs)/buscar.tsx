import { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function BuscarScreen() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearchCompleted, setIsSearchCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        setLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: coords.latitude, longitude: coords.longitude });
      setLoading(false);
    })();
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3 || isSearchCompleted) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`,
        {
          headers: {
            'User-Agent': 'MiAppReactNative/1.0',
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query) {
      Alert.alert('Error', 'Ingresa un lugar para buscar');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`,
        {
          headers: {
            'User-Agent': 'MiAppReactNative/1.0',
          },
        }
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
        setSearchQuery(data[0].display_name);
        setSuggestions([]);
        setIsSearchCompleted(true); // Marca la búsqueda como completada
      } else {
        Alert.alert('Error', 'No se encontraron resultados para la búsqueda');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
      console.error(error);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.display_name);
    setIsSearchCompleted(true); // Marca la búsqueda como completada
    handleSearch(suggestion.display_name);
  };

  if (loading || !location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.viewContainer}>
        <TouchableOpacity onPress={() => handleSearch()}>
          <Ionicons name="search-outline" style={styles.iconLeft} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Buscar rutas o destinos..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            setIsSearchCompleted(false); // Habilita sugerencias al escribir
            fetchSuggestions(text);
          }}
        />
      </View>
      {suggestions.length > 0 && (
        <FlatList
          style={styles.suggestionsContainer}
          data={suggestions}
          keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={styles.suggestionText}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <MapView
        style={styles.map}
        region={{
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={location}
          title={searchQuery || 'Ubicación actual'}
        />
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    flex: 1,
  },
  viewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  iconLeft: {
    fontSize: 20,
    color: '#007AFF',
    marginRight: 8,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
});
