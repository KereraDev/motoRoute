import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCameraStore } from '@/store/cameraStore';
import firestore from '@react-native-firebase/firestore';
import { useUserStore } from '@/store/userStore';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function CrearRuta() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [rutaRecorrida, setRutaRecorrida] = useState<LocationCoords[]>([]);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);

  const seguimientoRef = useRef<Location.LocationSubscription | null>(null);
  const router = useRouter();
  const { photoUri, clearPhoto } = useCameraStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (photoUri && !imageUri) {
      setImageUri(photoUri);
    }
  }, [photoUri, imageUri]);

  const openCamera = useCallback(() => {
    router.push('/camera');
  }, [router]);

  const comenzarSeguimiento = useCallback(async () => {
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
  }, []);

  const detenerSeguimiento = useCallback(() => {
    if (seguimientoRef.current) {
      seguimientoRef.current.remove();
      seguimientoRef.current = null;
    }
    setSeguimientoActivo(false);
  }, []);

  const limpiarFormulario = useCallback(() => {
    clearPhoto();
    setTitulo('');
    setDescripcion('');
    setImageUri(undefined);
    setRutaRecorrida([]);
    detenerSeguimiento();
  }, [clearPhoto, detenerSeguimiento]);

  const handlePost = useCallback(async () => {
    const missingFields = [];
    if (!titulo.trim()) missingFields.push('Título');
    if (!descripcion.trim()) missingFields.push('Descripción');
    if (rutaRecorrida.length < 2) missingFields.push('Ruta Recorrida');

    if (missingFields.length > 0) {
      Alert.alert(
        'Error',
        `Completa los siguientes campos:\n- ${missingFields.join('\n- ')}`
      );
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No hay usuario autenticado.');
      return;
    }

    try {
      // Si en el futuro quieres subir la foto, aquí iría la lógica de Storage.
      // Por ahora solo guarda la URI si existe.
      const fotoUrl = imageUri ?? '';

      const dataToSave = {
        coordenadas: rutaRecorrida,
        creadorUid: user.uid,
        nombreVisible:
          user.nombreVisible ?? user.nombre ?? 'No se encontro usuario',
        descripcion,
        fechaCreacion: firestore.FieldValue.serverTimestamp(),
        participantes: [user.uid],
        publica: true,
        titulo,
        fotoUrl,
        likesCount: 0,
        commentsCount: 0,
      };
      console.log('Guardando en Firestore:', dataToSave);

      await firestore().collection('rutas').add(dataToSave);

      limpiarFormulario();
      router.replace('/crearRuta');
    } catch (e) {
      Alert.alert(
        'Error',
        `No se pudo guardar la ruta.\n${e instanceof Error ? e.message : JSON.stringify(e)}`
      );
    }
  }, [
    titulo,
    descripcion,
    rutaRecorrida,
    user,
    limpiarFormulario,
    router,
    imageUri,
  ]);

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
            placeholder="Título de la ruta."
            placeholderTextColor={isDark ? '#aaa' : '#999'}
            value={titulo}
            onChangeText={setTitulo}
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
            value={descripcion}
            onChangeText={setDescripcion}
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
          {Platform.OS !== 'web' ? (
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
          ) : (
            <View
              style={{
                height: 300,
                backgroundColor: '#eee',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text>Mapa no disponible en web</Text>
            </View>
          )}
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
