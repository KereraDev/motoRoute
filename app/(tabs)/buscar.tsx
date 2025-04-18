import React from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';

const datosSimulados = [
  'Valparaíso',
  'Santiago',
  'Puerto Montt',
  'La Serena',
  'Temuco',
  'Antofagasta',
  'Rancagua',
];

export default function BuscarScreen() {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar rutas o destinos..."
        style={styles.input}
        placeholderTextColor="#888"
      />
      <FlatList
        data={datosSimulados}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#000',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: '#fff',
  },
  item: {
    color: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
});
