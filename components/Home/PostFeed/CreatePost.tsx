// components/CreatePost.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NewPostInput } from '../../../types/Post';

type CreatePostProps = {
  onPostCreated: (post: NewPostInput) => void;
};


export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

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
    if (!text.trim()) {
      Alert.alert('Error', 'Escribe algo antes de publicar.');
      return;
    }

    onPostCreated({ text: text.trim(), imageUri });
    setText('');
    setImageUri(undefined);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="¿Qué estás pensando?"
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
      />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="Agregar Imagen" onPress={pickImage} />
      <Button title="Publicar" onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
  },
  input: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
});
