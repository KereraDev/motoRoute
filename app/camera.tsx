import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import type { CameraView as CameraViewType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCameraStore } from '@/store/cameraStore';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraViewType | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const router = useRouter();
  const { setPhotoUri } = useCameraStore();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Se necesita permiso para usar la cámara</Text>
        <Button title="Dar permiso" onPress={requestPermission} />
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPreviewUri(photo.uri); // Mostrar vista previa
    }
  };

  const handleUsePhoto = () => {
    if (previewUri) {
      setPhotoUri(previewUri);
      router.replace('/crearRuta');
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      {previewUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewUri }} style={styles.preview} />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleRetake}
              style={styles.retakeButton}
            >
              <Text style={styles.retakeText}>🔁 Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUsePhoto} style={styles.useButton}>
              <Text style={styles.useText}>✅ Usar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
              <Text style={styles.buttonText}>📸</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCamera} style={styles.flipButton}>
              <Text style={styles.flipText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  previewContainer: { flex: 1, justifyContent: 'center' },
  preview: { flex: 1, resizeMode: 'cover' },
  controls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 20,
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 50,
  },
  buttonText: { fontSize: 18 },
  flipButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 50,
  },
  flipText: { color: '#fff', fontSize: 18 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  retakeButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
  },
  useButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
  },
  retakeText: { color: '#000', fontSize: 16 },
  useText: { color: '#fff', fontSize: 16 },
  text: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
});
