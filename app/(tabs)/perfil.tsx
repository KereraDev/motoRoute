import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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

const theme = {
  light: {
    background: '#fff',
    cardBackground: '#f9f9f9',
    textPrimary: '#000',
    textSecondary: '#444',
    placeholder: '#555',
    border: '#ccc',
    saveButton: '#1f618d',
    cancelButton: '#aaa',
    headerColor: '#1e90ff',
    logoutButtonBg: '#e74c3c',
    overlayBg: 'rgba(0,0,0,0.5)',
    modalBg: '#fff',
    urlCardBg: '#f4f4f4',
  },
  dark: {
    background: '#121212',
    cardBackground: '#1e1e1e',
    textPrimary: '#fff',
    textSecondary: '#ccc',
    placeholder: '#ddd',
    border: '#333',
    saveButton: '#1f618d',
    cancelButton: '#555',
    headerColor: '#1e90ff',
    logoutButtonBg: '#e74c3c',
    overlayBg: 'rgba(0,0,0,0.5)',
    modalBg: '#1e1e1e',
    urlCardBg: '#2a2a2a',
  },
};

const createStyles = colors =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      alignItems: 'center',
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
      color: colors.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      width: '100%',
      marginVertical: 10,
      color: colors.textPrimary,
    },
    picker: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginVertical: 10,
      padding: 12,
      color: colors.textPrimary,
      backgroundColor: colors.cardBackground,
    },
    text: {
      fontSize: 15,
      textAlign: 'center',
      marginHorizontal: 20,
      color: colors.textPrimary,
    },
    label: {
      fontSize: 15,
      marginTop: 10,
      marginBottom: 2,
      marginLeft: 2,
      color: colors.textSecondary,
    },
    editButtons: {
      flexDirection: 'row',
      marginTop: 10,
    },
    saveButton: {
      backgroundColor: colors.saveButton,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 5,
    },
    saveButton2: {
      marginRight: 10,
      backgroundColor: colors.saveButton,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 5,
    },
    saveText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    cancelButton: {
      backgroundColor: colors.cancelButton,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 5,
    },
    cancelText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 10,
      gap: 10,
    },
    card: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 20,
      backgroundColor: colors.cardBackground,
      borderColor: colors.border,
      borderWidth: 0.5,
    },
    statsCard: {
      width: '100%',
      borderRadius: 12,
      padding: 16,
      backgroundColor: colors.cardBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.headerColor,
    },
    cardText: {
      fontSize: 14,
      marginBottom: 4,
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlayBg,
    },
    modalContainer: {
      backgroundColor: colors.modalBg,
      padding: 24,
      borderRadius: 12,
      width: '92%',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: 320,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.textPrimary,
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
    urlCard: {
      backgroundColor: colors.urlCardBg,
      borderRadius: 10,
      padding: 15,
      marginTop: 15,
      width: '100%',
    },
  });

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
  const colors = isDark ? theme.dark : theme.light;
  const styles = createStyles(colors);

  // Estados de usuario y edición
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [editDatos, setEditDatos] = useState(false);
  const [editMoto, setEditMoto] = useState(false);

  // Estados de campos editables
  const [nameInput, setNameInput] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cilindradaCC, setCilindradaCC] = useState(null);
  const [motoMarca, setMotoMarca] = useState('');
  const [motoModelo, setMotoModelo] = useState('');
  const [bio, setBio] = useState('');

  // Estadísticas
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [totalRutasCreadas, setTotalRutasCreadas] = useState(0);
  const [cantidadAmigos, setCantidadAmigos] = useState(0);

  // Avatar modal y URL externa
  const [modalVisible, setModalVisible] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const currentUid = auth().currentUser?.uid;
  useEffect(() => {
    const uid = currentUid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('usuarios')
      .doc(uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data() || {};
          setUserData(data);
          setNameInput(data.nombreVisible || '');
          setCiudad(data.ciudad || '');
          setBirthDate(data.fechaNacimiento?.toDate?.() || null);
          setCilindradaCC(data.cilindradaCC || null);
          setMotoMarca(data.motoMarca || '');
          setMotoModelo(data.motoModelo || '');
          setBio(data.biografia || '');
        }
      });

    firestore()
      .collection('rutas')
      .where('creadorUid', '==', uid)
      .get()
      .then(snapshot => {
        const publicaciones = snapshot.docs.filter(doc => {
          const data = doc.data();
          return !!data.descripcion || !!data.fotoUrl; // Aquí defines qué es una publicación
        });
        setTotalPublicaciones(publicaciones.length);
      })
      .catch(err =>
        console.log('Error al contar publicaciones desde rutas:', err)
      );

    // Consulta amistades aceptadas
    firestore()
      .collection('amigos')
      .where('usuarios', 'array-contains', uid)
      .where('estado', '==', 'aceptado')
      .get()
      .then(snapshot => {
        setCantidadAmigos(snapshot.size);
      })
      .catch(err => console.log('Error al cargar amigos:', err));

    firestore()
      .collection('rutas')
      .where('creadorUid', '==', uid)
      .get()
      .then(snapshot => {
        const rutasConCoordenadas = snapshot.docs.filter(doc => {
          const data = doc.data();
          return Array.isArray(data.coordenadas) && data.coordenadas.length > 0;
        });
        setTotalRutasCreadas(rutasConCoordenadas.length);
      })
      .catch(err => console.log('Error al cargar rutas:', err));

    return () => unsubscribe();
  }, [currentUid]);

  const validarURL = url => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(url);

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
        ciudad: ciudad.trim(),
      });
      setEditing(false);
      Alert.alert('Éxito', 'Datos del perfil actualizados');
    } catch (e) {
      console.error('Error al guardar perfil:', e);
    }
  };

  const handleCancel = () => {
    setNameInput(userData?.nombreVisible || '');
    setBirthDate(userData?.fechaNacimiento?.toDate?.() || null);
    setCilindradaCC(userData?.cilindradaCC || null);
    setMotoMarca(userData?.motoMarca || '');
    setMotoModelo(userData?.motoModelo || '');
    setBio(userData?.biografia || '');
    setEditing(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.text}>Cargando...</Text>
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
    <SafeAreaView style={styles.safeArea}>
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

        {editing ? (
          <>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.input}
              placeholder="Nombre visible"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
            />

            <TouchableOpacity
              onPress={() => setEditDatos(true)}
              activeOpacity={0.9}
            >
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                <Feather name="user-check" size={16} /> Nombre:{' '}
                {userData.nombreVisible}
              </Text>
              <Text style={styles.cardText}>
                <Feather name="map-pin" size={16} /> Ciudad:{' '}
                {userData.ciudad || 'No definida'}
              </Text>
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                <Feather name="calendar" size={16} /> Fecha de nacimiento:{' '}
                {fechaFormateada}
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

            <Text style={styles.label}>Cilindrada (cc):</Text>
            <Picker
              selectedValue={cilindradaCC}
              onValueChange={itemValue => setCilindradaCC(itemValue)}
              style={styles.picker}
            >
              <Picker.Item
                label="Selecciona una cilindrada"
                value={null}
                color={colors.textPrimary}
              />
              {[125, 150, 200, 250, 400, 500, 650, 750, 1000].map(cc => (
                <Picker.Item
                  key={cc}
                  label={`${cc} cc`}
                  value={cc}
                  color={colors.textPrimary}
                />
              ))}
            </Picker>

            <Text style={styles.label}>Marca de la moto:</Text>
            <TextInput
              value={motoMarca}
              onChangeText={setMotoMarca}
              style={styles.input}
              placeholder="Ej: Voge"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>Modelo:</Text>
            <TextInput
              value={motoModelo}
              onChangeText={setMotoModelo}
              style={styles.input}
              placeholder="Ej: DS525X"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>Biografía:</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Escribe algo sobre ti..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
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
            <Text style={styles.username}>{userData.nombreVisible}</Text>

            {editBio ? (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <Text style={styles.cardTitle}>
                  <Feather name="message-circle" size={18} /> Biografía
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  style={[
                    styles.input,
                    { height: 80, textAlignVertical: 'top' },
                  ]}
                  placeholder="Escribe algo sobre ti..."
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.saveButton2}
                    onPress={async () => {
                      await firestore().collection('usuarios').doc(uid).update({
                        biografia: bio.trim(),
                      });
                      setEditBio(false);
                    }}
                  >
                    <Text style={styles.saveText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setBio(userData.biografia || '');
                      setEditBio(false);
                    }}
                  >
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setEditBio(true)}
                activeOpacity={0.9}
                style={[
                  styles.card,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <Text style={styles.cardTitle}>
                  <Feather name="message-circle" size={18} /> Biografía
                </Text>
                <Text style={styles.cardText}>
                  {bio.trim() || 'Aún no tienes una biografía.'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.row}>
              {editDatos ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    <Feather name="user" size={18} /> Datos personales
                  </Text>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    style={styles.input}
                    placeholder="Nombre visible"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="words"
                  />
                  <TextInput
                    value={ciudad}
                    onChangeText={setCiudad}
                    style={styles.input}
                    placeholder="Ciudad"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="words"
                  />

                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.label}>
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
                  <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                      style={[styles.saveButton, { width: '100%' }]}
                      onPress={async () => {
                        await firestore()
                          .collection('usuarios')
                          .doc(uid)
                          .update({
                            nombreVisible: nameInput.trim(),
                            fechaNacimiento: birthDate,
                          });
                        setEditDatos(false);
                      }}
                    >
                      <Text style={styles.saveText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelButton, { width: '100%' }]}
                      onPress={() => {
                        handleCancel();
                        setEditDatos(false);
                      }}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setEditDatos(true)}
                  activeOpacity={0.9}
                  style={styles.card}
                >
                  <Text style={styles.cardTitle}>
                    <Feather name="user" size={18} /> Datos personales
                  </Text>
                  <Text style={styles.cardText}>
                    <Feather name="user-check" size={16} /> Nombre:{' '}
                    {userData.nombreVisible}
                  </Text>
                  <Text style={styles.cardText}>
                    <Feather name="map-pin" size={16} /> Ciudad:{' '}
                    {userData.ciudad || 'No definida'}
                  </Text>

                  <Text style={styles.cardText}>
                    <Feather name="calendar" size={16} /> Fecha de nacimiento:{' '}
                    {fechaFormateada}
                  </Text>
                </TouchableOpacity>
              )}

              {editMoto ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    <Feather name="activity" size={18} /> Motocicleta
                  </Text>
                  <TextInput
                    value={motoMarca}
                    onChangeText={setMotoMarca}
                    style={styles.input}
                    placeholder="Marca"
                    placeholderTextColor={colors.placeholder}
                  />
                  <TextInput
                    value={motoModelo}
                    onChangeText={setMotoModelo}
                    style={styles.input}
                    placeholder="Modelo"
                    placeholderTextColor={colors.placeholder}
                  />
                  <Picker
                    selectedValue={cilindradaCC}
                    onValueChange={itemValue => setCilindradaCC(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label="Selecciona una cilindrada"
                      value={null}
                    />
                    {[125, 150, 200, 250, 400, 500, 650, 750, 1000].map(cc => (
                      <Picker.Item key={cc} label={`${cc} cc`} value={cc} />
                    ))}
                  </Picker>
                  <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                      style={[styles.saveButton, { width: '100%' }]}
                      onPress={async () => {
                        await firestore()
                          .collection('usuarios')
                          .doc(uid)
                          .update({
                            motoMarca: motoMarca.trim(),
                            motoModelo: motoModelo.trim(),
                            cilindradaCC,
                          });
                        setEditMoto(false);
                      }}
                    >
                      <Text style={styles.saveText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelButton, { width: '100%' }]}
                      onPress={() => {
                        setMotoMarca(userData.motoMarca || '');
                        setMotoModelo(userData.motoModelo || '');
                        setCilindradaCC(userData.cilindradaCC || null);
                        setEditMoto(false);
                      }}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setEditMoto(true)}
                  activeOpacity={0.9}
                  style={styles.card}
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
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.statsCard}>
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
                <Feather name="users" size={16} /> Amigos: {cantidadAmigos}
              </Text>

              <Text style={styles.cardText}>
                <Feather name="edit-2" size={16} /> Publicaciones:{' '}
                {totalPublicaciones}
              </Text>
            </View>

            <View
              style={{ alignItems: 'center', marginTop: 24, width: '100%' }}
            >
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await auth().signOut();
                  } catch (e) {
                    Alert.alert('Error', 'No se pudo cerrar sesión');
                  }
                }}
                style={[
                  styles.cancelButton,
                  { width: '90%', backgroundColor: colors.logoutButtonBg },
                ]}
              >
                <Feather
                  name="log-out"
                  size={24}
                  color="#fff"
                  style={styles.cancelText}
                />
                <Text style={styles.cancelText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal visible={modalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Selecciona un avatar</Text>
                  <ScrollView
                    horizontal
                    contentContainerStyle={styles.avatarList}
                    showsHorizontalScrollIndicator={false}
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

                  <View style={styles.urlCard}>
                    <Text style={styles.cardTitle}>
                      Usar URL externa (Imgur/Postimages)
                    </Text>
                    <TextInput
                      placeholder="https://i.imgur.com/ejemplo.png"
                      placeholderTextColor={colors.placeholder}
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
                        } catch {
                          setUrlError('Error al guardar avatar.');
                        }
                      }}
                    >
                      <Text style={styles.saveText}>Usar esta URL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelButton, { marginTop: 18 }]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
