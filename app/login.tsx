import ThemedInput from '@/components/ui/ThemedInput';
import ThemedText from '@/components/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ciudadesDeChile } from '@/utils/ciudades';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const logoLight = require('../assets/images/logo-dark.png'); // fondo oscuro = logo claro
  const logoDark = require('../assets/images/logo-light.png');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isRegistering ? -SCREEN_WIDTH : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isRegistering]);

  // Cargar credenciales guardadas
  useEffect(() => {
    const loadRemembered = async () => {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      if (savedEmail || savedPassword) setRememberMe(true);
    };
    loadRemembered();
  }, []);

  const showError = error => {
    let mensaje = 'Ocurrió un error.';
    if (error && typeof error.code === 'string') {
      switch (error.code) {
        case 'auth/invalid-email':
          mensaje = 'El correo no tiene un formato válido.';
          break;
        case 'auth/user-not-found':
          mensaje = 'No existe una cuenta con este correo.';
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          mensaje = 'La contraseña es incorrecta.';
          break;
        case 'auth/email-already-in-use':
          mensaje = 'Este correo ya está registrado.';
          break;
        case 'auth/too-many-requests':
          mensaje = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        case 'auth/weak-password':
          mensaje = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/missing-password':
          mensaje = 'Debes ingresar una contraseña.';
          break;
        case 'auth/missing-email':
          mensaje = 'Debes ingresar un correo electrónico.';
          break;
        default:
          mensaje = 'Error desconocido: ' + error.message;
      }
    } else {
      mensaje = 'Error inesperado. Verifica los datos ingresados.';
    }

    Alert.alert('Error', mensaje);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Validación', 'Debes ingresar un correo electrónico.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validación', 'Debes ingresar una contraseña.');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);

      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const nombreValido =
      name &&
      name.trim().length >= 3 &&
      /^[a-zA-Z\s]+$/.test(name) &&
      !/^([a-zA-Z])\1{1,}$/.test(name.trim());

    if (!nombreValido) {
      Alert.alert('Nombre inválido', 'Ingresa un nombre real.');
      return;
    }

    if (!gender) {
      Alert.alert('Campo requerido', 'Selecciona un sexo.');
      return;
    }

    if (!birthDate) {
      Alert.alert('Campo requerido', 'Selecciona tu fecha de nacimiento.');
      return;
    }

    const hoy = new Date();
    const minimo = new Date(1900, 0, 1);
    if (birthDate > hoy || birthDate < minimo) {
      Alert.alert('Fecha inválida', 'Selecciona una fecha válida.');
      return;
    }
    if (!city) {
      Alert.alert('Campo requerido', 'Selecciona una ciudad.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar un correo.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar una contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const credenciales = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const uid = credenciales.user.uid;

      let uidInterno = 'uid001';
      try {
        const contadorRef = firestore()
          .collection('contadores')
          .doc('usuarios');
        await firestore().runTransaction(async transaction => {
          const snapshot = await transaction.get(contadorRef);
          let numero = 1;
          if (snapshot.exists) {
            numero = (snapshot.data()?.contador ?? 0) + 1;
          }
          uidInterno = `uid${String(numero).padStart(3, '0')}`;

          // Actualizar contador
          transaction.set(contadorRef, { contador: numero });

          // Guardar usuario con uidInterno generado
          transaction.set(firestore().collection('usuarios').doc(uid), {
            uidInterno,
            nombreVisible: name.trim(),
            correo: email.trim(),
            ciudad: city,
            rol: ['usuario'],
            biografia: '',
            fotoPerfilURL: 'fotoPerfil',
            fechaNacimiento: birthDate,
            fechaCreacion: firestore.FieldValue.serverTimestamp(),
            amigos: [],
            rutasCompletadas: [],
          });
        });
      } catch (firestoreError) {
        console.error('Error al guardar en Firestore:', firestoreError);
        Alert.alert('Error', 'Error al guardar los datos del usuario.');
        return;
      }

      router.replace('/(tabs)/main');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.fullContainer,
        { backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View
        style={{ opacity: fadeAnim, alignItems: 'center', marginBottom: 24 }}
      >
        <Image
          source={colorScheme === 'dark' ? logoLight : logoDark}
          style={styles.logo}
        />
      </Animated.View>

      <View style={{ overflow: 'hidden', width: SCREEN_WIDTH }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            width: SCREEN_WIDTH * 2,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {/* LOGIN */}
          <View style={styles.formPage}>
            <ThemedInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordContainer}>
              <ThemedInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.togglePassword}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recuérdame */}
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <ThemedText style={{ fontSize: 13 }}>
                {rememberMe ? '✅' : '⬜'} Recuérdame
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.5 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* REGISTRO */}
          <View style={styles.formPage}>
            <ThemedInput
              style={styles.input}
              placeholder="Nombre completo"
              value={name}
              onChangeText={setName}
            />
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ccc',
                },
              ]}
            >
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={{
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  height: 50,
                  width: '100%',
                }}
                dropdownIconColor={colorScheme === 'dark' ? '#fff' : '#000'}
              >
                <Picker.Item
                  label="Selecciona tu sexo"
                  value=""
                  enabled={false}
                />
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Femenino" value="Femenino" />
                <Picker.Item label="Prefiero no decirlo" value="Otro" />
              </Picker>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, { justifyContent: 'center' }]}
            >
              <ThemedText
                style={{
                  color: birthDate
                    ? Colors[colorScheme ?? 'light'].text
                    : '#888',
                }}
              >
                {birthDate
                  ? birthDate.toLocaleDateString()
                  : 'Fecha de nacimiento'}
              </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthDate || new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type !== 'dismissed' && date) {
                    setBirthDate(date);
                  }
                }}
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date()} // evita fechas futuras
              />
            )}

            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ccc',
                },
              ]}
            >
              <Picker
                selectedValue={city}
                onValueChange={setCity}
                style={{
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  height: 50,
                  width: '100%',
                }}
                dropdownIconColor={colorScheme === 'dark' ? '#fff' : '#000'}
              >
                <Picker.Item
                  label="Selecciona tu ciudad"
                  value=""
                  enabled={false}
                />
                {ciudadesDeChile.map(ciudad => (
                  <Picker.Item key={ciudad} label={ciudad} value={ciudad} />
                ))}
              </Picker>
            </View>

            <ThemedInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <ThemedInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.togglePassword}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <ThemedInput
                style={styles.passwordInput}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.togglePassword}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.5 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity
        onPress={() => setIsRegistering(!isRegistering)}
        disabled={loading}
      >
        <Text style={[styles.registerText, { color: '#007AFF' }]}>
          {isRegistering
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 12,
  },

  fullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderColor: '#ccc',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
  },
  togglePassword: {
    marginLeft: 10,
    fontSize: 18,
  },
  rememberMe: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: 5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  formPage: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 24,
  },
});
