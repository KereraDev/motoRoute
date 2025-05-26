import { Stack } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const dummyFriends = [
  { id: '1', name: 'Lucía' },
  { id: '2', name: 'Pedro' },
  { id: '3', name: 'Catalina' },
  { id: '4', name: 'Fabián' },
  { id: '5', name: 'Renata' },
];

export default function AmigosScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Amigos',
          animation: 'slide_from_right',
          headerStyle: { backgroundColor: '#fff' }, // 👈 fondo del header
        }}
      />
      <View style={styles.wrapper}>
        {/* Capa blanca fija para evitar el flash */}
        <View style={styles.backgroundFix} />
        <FlatList
          data={dummyFriends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Text style={styles.friend}>{item.name}</Text>
          )}
          contentContainerStyle={styles.content}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  backgroundFix: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff', // 👈 capa blanca fija
    zIndex: -1,
  },
  content: {
    padding: 20,
  },
  friend: {
    fontSize: 18,
    paddingVertical: 8,
  },
});
