import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { usePostStore } from '@/store/postStore';
import { useCameraStore } from '@/store/cameraStore';
import { NewPostInput } from '@/types/Post';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function Anadir() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [text, setText] = useState('');
  const [destino, setDestino] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [rutaRecorrida, setRutaRecorrida] = useState<LocationCoords[]>([]);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);

  const seguimientoRef = useRef<Location.LocationSubscription | null>(null);
  const router = useRouter();
  const addPost = usePostStore(state => state.addPost);
  const { photoUri, clearPhoto } = useCameraStore();

  useEffect(() => {
    if (photoUri && !imageUri) {
      setImageUri(photoUri);
    }
  }, [photoUri]);

  const openCamera = () => {
    router.push('/camera');
  };

  const handlePost = () => {
    const missingFields = [];
    if (!imageUri) missingFields.push('Imagen');
    if (!destino.trim()) missingFields.push('Título');
    if (!text.trim()) missingFields.push('Descripción');
    if (rutaRecorrida.length < 2) missingFields.push('Ruta Recorrida');

    if (missingFields.length > 0) {
      Alert.alert(
        'Error',
        `Completa los siguientes campos:\n- ${missingFields.join('\n- ')}`
      );
      return;
    }

    const newPost: NewPostInput = {
      text: `${destino}\n${text}`,
      imageUri,
      route: rutaRecorrida,
    };

    addPost(newPost);
    clearPhoto();
    setText('');
    setDestino('');
    setImageUri(undefined);
    setRutaRecorrida([]);
    detenerSeguimiento();
    router.replace('/main');
  };

  const comenzarSeguimiento = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación.');
      return;
    }

    setRutaRecorrida([]);
    setSeguimientoActivo(true);

    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      location => {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setRutaRecorrida(prev => [...prev, coords]);
      }
    );

    seguimientoRef.current = sub;
  };

  const detenerSeguimiento = () => {
    if (seguimientoRef.current) {
      seguimientoRef.current.remove();
      seguimientoRef.current = null;
    }
    setSeguimientoActivo(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#121212' : '#fff' },
        ]}
        edges={['top']}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>
              Crear Ruta
            </Text>
            <TouchableOpacity style={styles.imagePicker} onPress={openCamera}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <Ionicons
                  name="camera"
                  size={30}
                  color={isDark ? '#ccc' : '#888'}
                />
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Nombre de la ruta."
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            value={destino}
            onChangeText={setDestino}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
                color: isDark ? '#fff' : '#000',
              },
            ]}
          />

          <TextInput
            placeholder="Descripción."
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            value={text}
            onChangeText={setText}
            multiline
            style={[
              styles.input,
              styles.textarea,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
                color: isDark ? '#fff' : '#000',
              },
            ]}
          />

          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: '#008000' }]}
            onPress={
              seguimientoActivo ? detenerSeguimiento : comenzarSeguimiento
            }
          >
            <Text style={[styles.locationButtonText, { color: '#fff' }]}>
              {seguimientoActivo ? '🛑 Detener seguimiento' : '📌 Grabar ruta'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={{
              latitude: rutaRecorrida.at(-1)?.latitude ?? -33.4489,
              longitude: rutaRecorrida.at(-1)?.longitude ?? -70.6693,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {rutaRecorrida.length > 0 && (
              <Marker
                coordinate={rutaRecorrida[0]}
                title="Inicio"
                pinColor="green"
              />
            )}
            {rutaRecorrida.length > 1 && (
              <Polyline
                coordinates={rutaRecorrida}
                strokeColor="#28a745"
                strokeWidth={4}
              />
            )}
          </MapView>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.publish]}
            onPress={handlePost}
          >
            <Text style={styles.buttonText}>Publicar ruta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  locationButton: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  locationButtonText: {
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  buttonRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  publish: {
    backgroundColor: '#008000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
