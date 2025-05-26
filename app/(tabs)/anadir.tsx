import { usePostStore } from '@/store/postStore';
import { NewPostInput } from '@/types/Post';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Anadir() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [amigosSeleccionados, setAmigosSeleccionados] = useState<string[]>([]);

  const dummyFriends = ['Lucía', 'Pedro', 'Catalina', 'Fabián', 'Renata'];

  const toggleFriend = (name: string) => {
    setAmigosSeleccionados(prev =>
      prev.includes(name)
        ? prev.filter(amigo => amigo !== name)
        : [...prev, name]
    );
  };

  const router = useRouter();
  const addPost = usePostStore(state => state.addPost);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = () => {
    const missingFields = [];

    if (!title.trim()) missingFields.push('Título');
    if (!imageUri) missingFields.push('Imagen');
    if (!text.trim()) missingFields.push('Descripción');
    if (!origen.trim()) missingFields.push('Lugar de inicio');
    if (!destino.trim()) missingFields.push('Destino');

    if (missingFields.length > 0) {
      Alert.alert(
        'Campos faltantes',
        `Por favor completa los siguientes campos:\n- ${missingFields.join('\n- ')}`
      );
      return;
    }

    const amigosTexto = amigosSeleccionados.length
      ? `\n\n👥 Acompañantes:\n- ${amigosSeleccionados.join('\n- ')}`
      : '';

    const newPost: NewPostInput = {
      text: `📍 ${title}\n${text}\nInicio: ${origen} → Destino: ${destino}${amigosTexto}`,
      imageUri,
    };

    addPost(newPost);
    setTitle('');
    setText('');
    setOrigen('');
    setDestino('');
    setImageUri(undefined);
    setAmigosSeleccionados([]);

    Alert.alert('Éxito', '✅ Ruta publicada con éxito');

    router.replace('/');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Nueva ruta</Text>

          <TextInput
            placeholder="Título de la ruta"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Ionicons name="camera" size={40} color="#888" />
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Descripción"
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
            style={[styles.input, styles.textarea]}
          />

          <TextInput
            placeholder="Lugar de inicio"
            placeholderTextColor="#999"
            value={origen}
            onChangeText={setOrigen}
            style={styles.input}
          />

          <TextInput
            placeholder="Destino"
            placeholderTextColor="#999"
            value={destino}
            onChangeText={setDestino}
            style={styles.input}
          />

          <View style={styles.friendsSection}>
            <Text style={styles.label}>Acompañantes:</Text>
            {dummyFriends.map(name => (
              <TouchableOpacity
                key={name}
                onPress={() => toggleFriend(name)}
                style={[
                  styles.friendItem,
                  amigosSeleccionados.includes(name) && styles.selectedFriend,
                ]}
              >
                <Text>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.publish]}
              onPress={handlePost}
            >
              <Text style={styles.buttonText}>Publicar ruta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 200,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
  },
  friendsSection: {
    marginTop: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  friendItem: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 6,
  },
  selectedFriend: {
    backgroundColor: '#d0e8ff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  publish: {
    backgroundColor: '#2196F3',
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
