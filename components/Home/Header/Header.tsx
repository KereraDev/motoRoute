import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '../../../constants/Colors';

export default function Header() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: Colors[colorScheme ? 'light' : 'dark'].text }]}>
        MotoRoute
      </Text>
      <View style={styles.headerIcons}>
        <Pressable onPress={() => console.log('Abrir notificaciones')}>
          <Text style={styles.icon}>❤️</Text>
        </Pressable>
        <Pressable onPress={() => console.log('Abrir mensajes')}>
          <Text style={styles.icon}>✈️</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 24,
    marginLeft: 15,
  },
});
