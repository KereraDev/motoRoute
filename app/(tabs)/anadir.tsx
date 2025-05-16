import React, { useState } from "react";
import { TextInput, Button, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { NewPostInput } from "@/types/Post";
import { usePostStore } from "@/store/postStore";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Anadir() {
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const router = useRouter();
  const addPost = usePostStore((state) => state.addPost);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos");
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
      Alert.alert("Error", "Escribe algo antes de publicar.");
      return;
    }

    const newPost: NewPostInput = {
      text: text.trim(),
      imageUri,
    };

    // ⚠️ Aquí deberías guardar el post en un contexto o estado global (ej: Zustand, React Context)
    addPost(newPost);
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
});
