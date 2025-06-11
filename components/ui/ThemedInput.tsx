import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export default function ThemedInput(props: TextInputProps) {
  const theme = useColorScheme() ?? 'light';
  const textColor = Colors[theme].text;
  const backgroundColor = Colors[theme].background;

  return (
    <TextInput
      {...props}
      placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
      style={[styles.input, { color: textColor, backgroundColor }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 14, // sólo padding interior
  },
});
