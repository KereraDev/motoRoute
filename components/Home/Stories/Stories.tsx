import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { useColorScheme } from "../../../hooks/useColorScheme";
import { Colors } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

type Story = {
  id: string;
  username: string;
  image?: string;
};

export default function Stories() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([
    { id: "1", username: "user1" },
    { id: "2", username: "user2" },
    { id: "3", username: "user3" },
  ]);

  const addHistory = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("I need permission for the use cam");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newHistory: Story = {
        id: (stories.length + 1).toString(),
        username: `user${stories.length + 1}`,
        image: result.assets[0].uri,
      };
      setStories([newHistory, ...stories]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
      contentContainerStyle={styles.storiesContent}
    >
      <Pressable style={styles.story} onPress={addHistory}>
        <View style={[styles.storyCircle, styles.addStoryCircle]}>
          <Ionicons name="add" size={30} color="#fff" />
        </View>
        <Text
          style={[
            styles.storyUsername,
            { color: Colors[colorScheme ? "dark" : "light"].text },
          ]}
        >
          Tu historia
        </Text>
      </Pressable>

      {stories.map((story) => (
        <Pressable
          key={story.id}
          style={styles.story}
          onPress={() =>
            router.push({
              pathname: "/stories/[id]",
              params: {
                id: story.id,
                image: encodeURIComponent(story.image || ""),
              },
            })
          }
        >
          <View style={styles.storyCircle}>
            {story.image ? (
              <Image source={{ uri: story.image }} style={styles.storyImage} />
            ) : (
              <Text style={styles.storyText}>{story.username[0]}</Text>
            )}
          </View>
          <Text
            style={[
              styles.storyUsername,
              { color: Colors[colorScheme ? "dark" : "light"].text },
            ]}
          >
            {story.username}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  storiesContainer: {
    paddingVertical: 8,
  },
  storiesContent: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  story: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  storyCircle: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f09433",
    overflow: "hidden",
  },
  addStoryCircle: {
    backgroundColor: "#555",
    borderColor: "#888",
  },
  storyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 5,
    maxWidth: 60,
    textAlign: "center",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
