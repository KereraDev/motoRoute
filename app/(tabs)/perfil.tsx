import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

const avataresDisponibles = [
  'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
  'https://i.imgur.com/XFEjKr3.jpeg',
  'https://hondacenter.cl/wp-content/uploads/2019/03/1-28.png',
  'https://i.imgur.com/NrKS3ez.jpeg',
  'https://i.imgur.com/cb5BIbR.jpeg',
  'https://i.imgur.com/8A8xdF4.jpeg',
  'https://admin.imoto.crmpyme.com//files/bms_producto/40556/img_02.jpg',
  'https://soymotero.net/wp-content/uploads/2022/11/street_triple_rs_my23_carnival_red_anglerhs.png',
  'https://www.bikeexif.com/wp-content/uploads/2010/08/harley-davidson-sportster-a.jpg',
];

export default function PerfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Estados de usuario y edición
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  // Estados de campos editables
  const [nameInput, setNameInput] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cilindradaCC, setCilindradaCC] = useState<number | null>(null);
  const [motoMarca, setMotoMarca] = useState('');
  const [motoModelo, setMotoModelo] = useState('');
  const [bio, setBio] = useState('');

  // Estadísticas
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [totalRutasCreadas, setTotalRutasCreadas] = useState(0);

  // Avatar modal y URL externa
  const [modalVisible, setModalVisible] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos del usuario y estadísticas
  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    // Suscripción en tiempo real a los datos del usuario
    const unsubscribe = firestore()
      .collection('usuarios')
      .doc(uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data() || {};
          setUserData(data);
          setNameInput(data.nombreVisible || '');
          setBirthDate(data.fechaNacimiento?.toDate?.() || null);
          setCilindradaCC(data.cilindradaCC || null);
          setMotoMarca(data.motoMarca || '');
          setMotoModelo(data.motoModelo || '');
          setBio(data.biografia || '');
        }
      });

    // Consulta publicaciones
    firestore()
      .collection('publicaciones')
      .where('autorUid', '==', uid)
      .get()
      .then(snapshot => setTotalPublicaciones(snapshot.size))
      .catch(err => console.log('Error al cargar publicaciones:', err));

    // Consulta rutas creadas
    firestore()
      .collection('rutas')
      .where('creadorUid', '==', uid)
      .get()
      .then(snapshot => setTotalRutasCreadas(snapshot.size))
      .catch(err => console.log('Error al cargar rutas:', err));

    return () => unsubscribe();
  }, [auth().currentUser?.uid]);

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
    if (!motoMarca.trim() || !motoModelo.trim()) {
      Alert.alert('Error', 'Completa la marca y el modelo de tu motocicleta');
      return;
    }
    try {
      await firestore().collection('usuarios').doc(uid).update({
        nombreVisible: nameInput.trim(),
        fechaNacimiento: birthDate,
        cilindradaCC,
        motoMarca: motoMarca.trim(),
        motoModelo: motoModelo.trim(),
        biografia: bio.trim(),
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
    setBio(userData?.biografia || '');
    setEditing(false);
  };

  // Cambiar fecha de nacimiento
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  };

  // Validar URL de imagen
  const validarURL = (url: string): boolean => {
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(url);
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  const uid = auth().currentUser?.uid;
  if (!uid) {
    Alert.alert('Error', 'No se encontró el usuario');
    return null;
  }

  const fechaFormateada = birthDate?.toDateString() ?? 'No definida';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{
              uri:
                userData.fotoPerfilURL ||
                'https://ui-avatars.com/api/?name=Usuario',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        {/* Edición */}
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
              style={[styles.picker, { color: isDark ? '#fff' : '#000' }]}
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

            <Text style={[styles.label, { color: isDark ? '#ccc' : '#555' }]}>
              Biografía:
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              numberOfLines={3}
              placeholder="Escribe algo sobre ti..."
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

            {/* Tarjeta: Biografía editable */}
            <TouchableOpacity
              onPress={() => setEditing(true)}
              activeOpacity={0.9}
              style={[
                styles.bioCard,
                { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
              ]}
            >
              <Text style={styles.cardTitle}>
                <Feather name="message-circle" size={18} /> Biografía
              </Text>
              <Text style={styles.cardText}>
                {bio?.trim() ? bio : 'Aún no tienes una biografía.'}
              </Text>
            </TouchableOpacity>

            {/* Tarjetas: Datos personales y Motocicleta */}
            <View style={styles.row}>
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
                  {fechaFormateada}
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
                  <Feather name="activity" size={18} /> Motocicleta
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
                  <Feather name="cpu" size={16} /> Cilindrada:{' '}
                  {userData.cilindradaCC
                    ? `${userData.cilindradaCC} cc`
                    : 'No definida'}
                </Text>
              </View>
            </View>

            {/* Tarjeta: Estadísticas */}
            <View
              style={[
                styles.statsCard,
                { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
              ]}
            >
              <Text style={styles.cardTitle}>
                <Feather name="bar-chart-2" size={18} /> Estadísticas
              </Text>
              <Text style={styles.cardText}>
                <Feather name="map-pin" size={16} /> Rutas completadas:{' '}
                {userData.rutasCompletadas?.length || 0}
              </Text>
              <Text style={styles.cardText}>
                <Feather name="map" size={16} /> Rutas creadas:{' '}
                {totalRutasCreadas}
              </Text>
              <Text style={styles.cardText}>
                <Feather name="users" size={16} /> Amigos:{' '}
                {userData.amigos?.length || 0}
              </Text>
              <Text style={styles.cardText}>
                <Feather name="edit-2" size={16} /> Publicaciones:{' '}
                {totalPublicaciones}
              </Text>
            </View>

            {/* Botones de editar perfil y cerrar sesión alineados */}
            <View style={styles.editLogoutRow}>
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await auth().signOut();
                  } catch (e) {
                    Alert.alert('Error', 'No se pudo cerrar sesión');
                  }
                }}
                style={styles.logoutButton}
              >
                <Feather name="log-out" size={20} color="#e53935" style={{ marginRight: 5 }} />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modal de selección de avatar con URL externa */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => null}>
                <KeyboardAvoidingView
                  style={styles.modalContainer}
                  behavior="padding"
                >
                  <Text style={styles.modalTitle}>Selecciona un avatar</Text>

                  <ScrollView
                    horizontal
                    contentContainerStyle={styles.avatarList}
                  >
                    {avataresDisponibles.map((url, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={async () => {
                          await firestore()
                            .collection('usuarios')
                            .doc(uid)
                            .update({ fotoPerfilURL: url });
                          setModalVisible(false);
                        }}
                      >
                        <Image
                          source={{ uri: url }}
                          style={styles.avatarOption}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Tarjeta para ingresar URL externa */}
                  <View style={styles.urlCard}>
                    <Text style={styles.cardTitle}>
                      Usar URL externa (Imgur/Postimages)
                    </Text>
                    <TextInput
                      placeholder="https://i.imgur.com/ejemplo.png"
                      value={customAvatarUrl}
                      onChangeText={text => {
                        setCustomAvatarUrl(text);
                        setUrlError('');
                        setShowPreview(validarURL(text));
                      }}
                      style={styles.input}
                      autoCapitalize="none"
                    />
                    {urlError ? (
                      <Text style={{ color: 'red' }}>{urlError}</Text>
                    ) : null}

                    {showPreview && (
                      <Image
                        source={{ uri: customAvatarUrl }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          alignSelf: 'center',
                          marginVertical: 8,
                        }}
                      />
                    )}

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={async () => {
                        if (!validarURL(customAvatarUrl)) {
                          setUrlError(
                            'URL inválida. Debe terminar en .jpg, .jpeg, .png o .gif'
                          );
                          return;
                        }

                        try {
                          await firestore()
                            .collection('usuarios')
                            .doc(uid)
                            .update({
                              fotoPerfilURL: customAvatarUrl,
                            });
                          setModalVisible(false);
                          setCustomAvatarUrl('');
                          setShowPreview(false);
                        } catch (e) {
                          setUrlError('Error al guardar avatar.');
                        }
                      }}
                    >
                      <Text style={styles.saveText}>Usar esta URL</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>Cancelar</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    gap: 10, // Si tu versión lo soporta
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4, // Si no usas gap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  statsCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5, // antes estaba en 10 o más
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e90ff',
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  avatarList: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 5,
  },
  closeButton: {
    color: '#e53935',
    marginTop: 10,
    fontWeight: 'bold',
  },
  urlCard: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    width: '100%',
  },
  bioCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editLogoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 15,
  },
  editProfileButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#1e90ff',
    alignSelf: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editProfileText: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e53935',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    color: '#e53935',
    fontWeight: 'bold',
  },
});
