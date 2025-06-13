import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

export default function PerfilScreen() {
  // Hooks de estado
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [cilindradaCC, setCilindradaCC] = useState<number | null>(null);
  const [motoMarca, setMotoMarca] = useState('');
  const [motoModelo, setMotoModelo] = useState('');

  // Cargar datos del usuario en tiempo real
  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (uid) {
      const unsubscribe = firestore()
        .collection('usuarios')
        .doc(uid)
        .onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            setUserData(data);
            setNameInput(data.nombreVisible || '');
            setBirthDate(data.fechaNacimiento?.toDate?.() || null);
            setCilindradaCC(data.cilindradaCC || null);
            setMotoMarca(data.motoMarca || '');
            setMotoModelo(data.motoModelo || '');
          }
        });
      return () => unsubscribe();
    }
  }, []);

  // Guardar cambios en el perfil
  const handleSaveProfile = async () => {
    const uid = auth().currentUser?.uid;
    if (!nameInput.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    if (!birthDate) {
      Alert.alert('Error', 'Debes seleccionar una fecha de nacimiento');
      return;
    }
    try {
      await firestore().collection('usuarios').doc(uid).update({
        nombreVisible: nameInput.trim(),
        fechaNacimiento: birthDate,
        cilindradaCC,
        motoMarca: motoMarca.trim(),
        motoModelo: motoModelo.trim(),
      });
      setEditing(false);
      Alert.alert('Éxito', 'Datos del perfil actualizados');
    } catch (e) {
      console.error('Error al guardar perfil:', e);
    }
  };

  // Cancelar edición y restaurar datos originales
  const handleCancel = () => {
    setNameInput(userData?.nombreVisible || '');
    setBirthDate(userData?.fechaNacimiento?.toDate?.() || null);
    setCilindradaCC(userData?.cilindradaCC || null);
    setMotoMarca(userData?.motoMarca || '');
    setMotoModelo(userData?.motoModelo || '');
    setEditing(false);
  };

  // Cambiar fecha de nacimiento
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  };

  // Si no hay datos del usuario, mostrar cargando
  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  // Si no hay usuario logueado
  const uid = auth().currentUser?.uid;
  if (!uid) {
    Alert.alert('Error', 'No se encontró el usuario');
    return null;
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{
            uri:
              userData.fotoPerfilURL ||
              'https://ui-avatars.com/api/?name=Usuario',
          }}
          style={styles.avatar}
        />

        {editing ? (
          <>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
              placeholder="Nombre visible"
              autoCapitalize="words"
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.text, { color: isDark ? '#ddd' : '#333' }]}>
                Fecha de nacimiento:{' '}
                {birthDate ? birthDate.toDateString() : 'No definida'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>
              Cilindrada (cc):
            </Text>
            <Picker
              selectedValue={cilindradaCC}
              onValueChange={itemValue => setCilindradaCC(itemValue)}
              style={[styles.picker, { height: 50 }]}
            >
              <Picker.Item label="Selecciona una cilindrada" value={null} />
              {[150, 200, 250, 400, 500, 650, 750, 1000].map(cc => (
                <Picker.Item key={cc} label={`${cc} cc`} value={cc} />
              ))}
            </Picker>

            <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>
              Marca de la moto:
            </Text>
            <TextInput
              value={motoMarca}
              onChangeText={setMotoMarca}
              style={styles.input}
              placeholder="Ej: Voge"
            />

            <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>
              Modelo:
            </Text>
            <TextInput
              value={motoModelo}
              onChangeText={setMotoModelo}
              style={styles.input}
              placeholder="Ej: DS525X"
            />

            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text
              style={[styles.username, { color: isDark ? '#fff' : '#000' }]}
            >
              {userData.nombreVisible}
            </Text>

            {/* Tarjeta: Datos personales */}
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
              ]}
            >
              <Text style={styles.cardTitle}>
                <Feather name="user" size={18} /> Datos personales
              </Text>
              <Text style={styles.cardText}>
                <Feather name="user-check" size={16} /> Nombre:{' '}
                {userData.nombreVisible}
              </Text>
              <Text
                style={[styles.cardText, { color: isDark ? '#ddd' : '#444' }]}
              >
                <Feather name="calendar" size={16} /> Fecha de nacimiento:{' '}
                {birthDate ? birthDate.toDateString() : 'No definida'}
              </Text>
            </View>

            {/* Tarjeta: Motocicleta */}
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
              ]}
            >
              <Text style={styles.cardTitle}>
                <Feather name="truck" size={18} /> Motocicleta
              </Text>
              <Text style={styles.cardText}>
                <Feather name="tag" size={16} /> Marca:{' '}
                {userData.motoMarca || 'No definida'}
              </Text>
              <Text style={styles.cardText}>
                <Feather name="layers" size={16} /> Modelo:{' '}
                {userData.motoModelo || 'No definido'}
              </Text>
              <Text style={styles.cardText}>
                <Feather name="activity" size={16} /> Cilindrada:{' '}
                {userData.cilindradaCC
                  ? `${userData.cilindradaCC} cc`
                  : 'No definida'}
              </Text>
            </View>

            {/* Botón para editar */}
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={{ color: '#1e90ff', marginTop: 10 }}>
                Editar perfil
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginVertical: 10,
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  label: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 2,
    marginLeft: 2,
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  saveButton: {
    marginRight: 10,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#aaa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e90ff',
  },
  cardText: {
    fontSize: 15,
    marginBottom: 6,
    flexDirection: 'row',
  },
});
