import React from "react";
import { Pressable, Text, StyleSheet, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";

type ButtonLikeProps = {
  liked: boolean;
  likes: number;
  onToggle: () => void;
};

export default function ButtonLike({
  liked,
  likes,
  onToggle,
}: ButtonLikeProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
    >
      <Text
        style={[
          styles.icon,
          {
            color: liked ? "tomato" : Colors[colorScheme ?? "light"].text,
          },
        ]}
      >
        {liked ? "❤️" : "🤍"} {likes}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    marginRight: 15,
  },
});
